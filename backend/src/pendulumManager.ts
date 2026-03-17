import { fork } from "child_process";
import type { ChildProcess, Serializable } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { uuidv7 } from "uuidv7";
import type { InitPendulumRequestDto } from "@pendulum-simulation/common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SimulationState = "running" | "paused" | "stopped";

export class PendulumManager {
  private instances: Record<string, ChildProcess> = {};
  private state: SimulationState = "running";

  add(data: InitPendulumRequestDto): string {
    const { angle, length, mass, pivotPosition } = data;
    const { x, y } = pivotPosition;
    const id = uuidv7();
    const args = [id, `${angle}`, `${length}`, `${mass}`, `${x}`, `${y}`];
    this.instances[id] = fork(path.join(__dirname, "pendulumProc"), args, {
      silent: true,
    });
    this.instances[id].stderr!.on("data", (msg: Buffer) => {
      console.log(`[${id}]: [${msg.toString().trim()}]`);
    });
    const initialCommand =
      this.state === "running" ? "PLAY" : this.state === "paused" ? "PAUSE" : "STOP";
    this.instances[id].send({ command: initialCommand });
    return id;
  }

  shutdown(id: string): void {
    this.instances[id]?.send({ command: "SHUTDOWN" });
    delete this.instances[id];
  }

  shutdownAll(): void {
    for (const id of Object.keys(this.instances)) {
      this.shutdown(id);
    }
  }

  pauseAll(): void {
    this.state = "paused";
    for (const id of Object.keys(this.instances)) {
      this.instances[id]?.send({ command: "PAUSE" });
    }
  }

  stopAll(): void {
    this.state = "stopped";
    for (const id of Object.keys(this.instances)) {
      this.instances[id]?.send({ command: "STOP" });
    }
  }

  playAll(): void {
    this.state = "running";
    for (const id of Object.keys(this.instances)) {
      this.instances[id]?.send({ command: "PLAY" });
    }
  }

  setGravity(value: number): void {
    for (const id of Object.keys(this.instances)) {
      this.instances[id]?.send({ command: "SET_GRAVITY", gravity: value });
    }
  }

  update(id: string, data: InitPendulumRequestDto): void {
    this.instances[id]?.send({ command: "UPDATE", data });
  }

  get(id: string): ChildProcess | undefined {
    return this.instances[id];
  }

  async getPosition(id: string): Promise<string> {
    const child = this.instances[id];
    if (!child) {
      throw new Error("Pendulum not initialized");
    }
    child.send({ command: "POSITION" });
    return new Promise((resolve, reject) => {
      child.once("message", (message: Serializable) => {
        resolve(message.toString());
      });
      child.on("error", (err) => {
        reject(err);
      });
      child.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Child exited with code ${code}`));
        }
      });
    });
  }
}
