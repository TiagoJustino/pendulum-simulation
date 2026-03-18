import type {
  AbsolutePosition,
  InitPendulumRequestDto,
  Point,
} from "@pendulum-simulation/common";
import type { PendulumMqttClient } from "./mqttClient.js";

/*
## References:
- The Code Train - Simple Pendulum Simulation: https://www.youtube.com/watch?v=NBWMtlbbOag
- The Nature of Code - https://natureofcode.com/oscillation/#the-pendulum

      angle
       .
  l   /| y
     / |
    O -
      x
## position
sin(angle) = x / l => x = l * sin(angle)
cos(angle) = y / l => y = l * cos(angle)

### References for adding the wind component:

- The Code Train - Simulating Forces: Gravity and Wind - The Nature of Code: https://www.youtube.com/watch?v=Uibl0UE4VH8
- The Nature of Code - https://natureofcode.com/forces/#force-accumulation

 */

enum Command {
  RESTART = "RESTART",
  STOP = "STOP",
  PAUSE = "PAUSE",
}

const PEER_TTL_MS = 150;
// Window to collect all STOP messages before electing a coordinator
const ELECTION_WINDOW_MS = 200;
// How long coordinator waits for all ACKs before forcing restart
const COORDINATOR_TIMEOUT_MS = 8000;
// How long a follower waits for RESTART before self-restarting
const FOLLOWER_TIMEOUT_MS = 10000;
const dt = 0.4; // < 1 slows down, > 1 speeds up

type CollisionRole = "none" | "detector" | "coordinator" | "follower";

export class Pendulum {
  private bobPosition: Point | undefined;
  // angle in radians
  private angle: number | undefined;
  private angleVelocity: number | undefined;
  private intervalId: NodeJS.Timeout | undefined;

  // Presence tracking: peerId -> lastSeen timestamp
  private knownPeers = new Map<string, number>();

  // Collision coordination state
  private collisionRole: CollisionRole = "none";
  // IDs that sent STOP in this collision round (detected collision themselves)
  private collisionDetectors = new Set<string>();
  // Snapshot of peers active at the moment collision was first detected
  private peersAtCollision = new Set<string>();
  // ACKs received during this collision round (accumulated before election too)
  private receivedAcks = new Set<string>();
  // Peers the coordinator is still waiting on
  private pendingAcks = new Set<string>();
  private electionTimer: NodeJS.Timeout | undefined;
  private restartTimeoutTimer: NodeJS.Timeout | undefined;
  private restartCooldownTimer: NodeJS.Timeout | undefined;
  private collisionEnabled = true;

  // angle is in degrees, length is in pixels, mass is in arbitrary units (= bob radius in px)
  constructor(
    private initialAngle: number,
    private length: number,
    private mass: number,
    private pivotPosition: Point,
    private mqttClient: PendulumMqttClient | null = null,
    private gravity: number = 9.8,
    private wind: number = 0,
  ) {
    this.init();
    this.start();
  }

  init() {
    this.angle = this.initialAngle * (Math.PI / 180);
    this.bobPosition = {
      x: this.length * Math.sin(this.angle),
      y: this.length * Math.cos(this.angle),
    };
    this.angleVelocity = 0;
  }

  start() {
    // Skip if already started
    if (this.intervalId) {
      return;
    }
    this.startRestartCooldown();
    // update and publish the pendulum position every 30ms
    this.intervalId = setInterval(async () => {
      this.nextPosition();
      await this.mqttPublishPosition();
    }, 30);
  }

  async mqttDisconnect(): Promise<void> {
    if (this.mqttClient) {
      await this.mqttClient.shutdown();
    }
  }

  checkColision(position: AbsolutePosition): boolean {
    const bobAPosition = this.getAbsoluteBobPosition();
    const bobBPosition = position.bobPosition;
    const xDist = Math.abs(bobAPosition.x - bobBPosition.x);
    const yDist = Math.abs(bobAPosition.y - bobBPosition.y);
    const dist = Math.sqrt(xDist ** 2 + yDist ** 2);
    return dist <= this.mass + position.mass;
  }

  private getActivePeers(): Set<string> {
    const now = Date.now();
    const active = new Set<string>();
    for (const [id, ts] of this.knownPeers) {
      if (now - ts <= PEER_TTL_MS) active.add(id);
    }
    return active;
  }

  private startElectionTimer() {
    clearTimeout(this.electionTimer);
    this.electionTimer = setTimeout(
      () => this.runElection(),
      ELECTION_WINDOW_MS,
    );
  }

  private runElection() {
    if (this.collisionRole !== "detector") return;

    const myId = this.mqttClient!.id;
    const minId = [...this.collisionDetectors].sort()[0];

    if (minId === myId) {
      this.collisionRole = "coordinator";
      this.pendingAcks = new Set(this.peersAtCollision);
      // Remove ACKs already received during the election window
      for (const id of this.receivedAcks) {
        this.pendingAcks.delete(id);
      }
      this.restartTimeoutTimer = setTimeout(
        () => this.doRestart(),
        COORDINATOR_TIMEOUT_MS,
      );
      this.checkAllAcks();
    } else {
      // Lost election — wait for coordinator to send RESTART
      this.collisionRole = "follower";
      this.restartTimeoutTimer = setTimeout(
        () => this.doRestart(),
        FOLLOWER_TIMEOUT_MS,
      );
    }
  }

  private checkAllAcks() {
    if (this.collisionRole !== "coordinator") return;
    if (this.pendingAcks.size === 0) {
      clearTimeout(this.restartTimeoutTimer);
      this.mqttClient?.publishCountdown(3);
      this.restartTimeoutTimer = setTimeout(() => this.doRestart(), 3000);
    }
  }

  private async doRestart() {
    const wasCoordinator = this.collisionRole === "coordinator";
    this.resetCollisionState();
    if (wasCoordinator) {
      await this.mqttClient?.publishCommand(Command.RESTART);
    }
    this.init();
    this.start();
  }

  private resetCollisionState() {
    this.collisionRole = "none";
    this.collisionDetectors.clear();
    this.peersAtCollision.clear();
    this.receivedAcks.clear();
    this.pendingAcks.clear();
    clearTimeout(this.electionTimer);
    clearTimeout(this.restartTimeoutTimer);
    clearTimeout(this.restartCooldownTimer);
    this.electionTimer = undefined;
    this.restartTimeoutTimer = undefined;
    this.restartCooldownTimer = undefined;
    this.collisionEnabled = true;
  }

  private startRestartCooldown() {
    this.collisionEnabled = false;
    clearTimeout(this.restartCooldownTimer);
    this.restartCooldownTimer = setTimeout(() => {
      this.collisionEnabled = true;
    }, 500);
  }

  async onPosition(id: string, position: AbsolutePosition): Promise<void> {
    this.knownPeers.set(id, Date.now());

    if (this.collisionRole !== "none") return;
    if (!this.collisionEnabled) return;

    if (this.checkColision(position)) {
      // Snapshot active peers BEFORE pausing (they'll stop publishing)
      this.peersAtCollision = this.getActivePeers();
      this.pause();
      this.collisionRole = "detector";
      this.collisionDetectors.add(this.mqttClient!.id);

      await this.mqttClient!.publishCommand(Command.STOP);
      await this.mqttClient!.publishStatus("ACK");
      this.startElectionTimer();
    }
  }

  async onCommand(command: string, fromId: string): Promise<void> {
    if (command === Command.STOP) {
      this.collisionDetectors.add(fromId);

      if (this.collisionRole === "none") {
        // Received STOP without detecting collision — become follower
        if (!this.peersAtCollision.size) {
          this.peersAtCollision = this.getActivePeers();
        }
        this.pause();
        this.collisionRole = "follower";
        await this.mqttClient!.publishStatus("ACK");
        this.restartTimeoutTimer = setTimeout(
          () => this.doRestart(),
          FOLLOWER_TIMEOUT_MS,
        );
      } else if (this.collisionRole === "detector") {
        // Another detector joined — reset election window
        this.startElectionTimer();
      }
    } else if (command === Command.RESTART) {
      if (this.collisionRole !== "coordinator") {
        this.resetCollisionState();
        this.init();
        this.start();
      }
    }
  }

  async onStatus(id: string, status: string): Promise<void> {
    if (status !== "ACK") return;

    this.receivedAcks.add(id);

    if (this.collisionRole === "coordinator") {
      this.pendingAcks.delete(id);
      this.checkAllAcks();
    }
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  stop() {
    this.resetCollisionState();
    this.pause();
    this.init();
  }

  async dispose(): Promise<void> {
    this.resetCollisionState();
    this.pause();
    await this.mqttDisconnect();
  }

  update(data: InitPendulumRequestDto) {
    this.resetCollisionState();
    const wasRunning = !!this.intervalId;
    this.pause();
    this.initialAngle = data.angle;
    this.length = data.length;
    this.mass = data.mass;
    this.pivotPosition.x = data.pivotPosition.x;
    this.pivotPosition.y = data.pivotPosition.y;
    this.init();
    if (wasRunning) {
      this.start();
    }
  }

  getRelativeBobPosition(): Point {
    return this.bobPosition!;
  }

  getAbsoluteBobPosition(): Point {
    return {
      x: this.bobPosition!.x + this.pivotPosition.x,
      y: this.bobPosition!.y + this.pivotPosition.y,
    };
  }

  async mqttPublishPosition(): Promise<void> {
    if (this.mqttClient) {
      await this.mqttClient.publishPosition({
        pivotPosition: this.pivotPosition,
        bobPosition: this.getAbsoluteBobPosition(),
        mass: this.mass,
      });
    }
  }

  setGravity(value: number): void {
    if (!isFinite(value)) return;
    this.gravity = value;
  }

  setWind(value: number): void {
    if (!isFinite(value)) return;
    this.wind = value;
  }

  // Update the pendulum's position to next frame
  nextPosition(): void {
    const resultantGravityForce = this.gravity * Math.sin(this.angle!);
    const resultantWindForce = this.wind * Math.cos(this.angle!);
    const gravityAngleAccel = (-1 * resultantGravityForce) / this.length;
    const windAngleAccel = resultantWindForce / (this.mass * this.length);
    const angleAccel = gravityAngleAccel + windAngleAccel;
    this.angleVelocity! += angleAccel * dt;
    this.angle! += this.angleVelocity! * dt;
    this.bobPosition!.x = this.length * Math.sin(this.angle!);
    this.bobPosition!.y = this.length * Math.cos(this.angle!);
  }
}
