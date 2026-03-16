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

 */

enum Command {
  RESTART = "RESTART",
  STOP = "STOP",
  PAUSE = "PAUSE",
  START = "START",
}

const GRAVITY = 2;

export class Pendulum {
  private bobPosition: Point | undefined;
  // angle in radians
  private angle: number | undefined;
  private angleVelocity: number | undefined;
  private intervalId: NodeJS.Timeout | undefined;

  // angle is in degrees, length is in pixels
  constructor(
    private initialAngle: number,
    private length: number,
    private pivotPosition: Point,
    private mqttClient: PendulumMqttClient | null = null,
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
    // update and publish the pendulum position every 15ms
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
    // TODO: consider variable sizes
    return dist <= 50;
  }

  // TODO: Consider pivotPosition
  async onPosition(position: AbsolutePosition): Promise<void> {
    if (this.checkColision(position)) {
      await this.mqttClient!.publishCommand(Command.STOP);
    }
  }

  async onCommand(command: string): Promise<void> {
    if (command === Command.STOP) {
      this.pause();
      setTimeout(() => {
        this.mqttClient?.publishCommand(Command.RESTART);
      }, 5000);
    } else if (command === Command.RESTART) {
      this.init();
      this.start();
    }
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  async dispose(): Promise<void> {
    this.pause();
    await this.mqttDisconnect();
  }

  update(data: InitPendulumRequestDto) {
    this.pause();
    this.initialAngle = data.angle;
    this.length = data.length;
    this.pivotPosition.x = data.pivotPosition.x;
    this.pivotPosition.y = data.pivotPosition.y;
    this.init();
    this.start();
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
      });
    }
  }

  // Update the pendulum's position to next frame
  nextPosition(): void {
    const resultantForce = GRAVITY * Math.sin(this.angle!);
    const angleAccel = (-1 * resultantForce) / this.length;
    this.angleVelocity! += angleAccel;
    this.angle! += this.angleVelocity!;
    this.bobPosition!.x = this.length * Math.sin(this.angle!);
    this.bobPosition!.y = this.length * Math.cos(this.angle!);
  }
}
