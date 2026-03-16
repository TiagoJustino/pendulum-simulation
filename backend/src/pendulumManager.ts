import { fork } from "child_process";
import type { ChildProcess, Serializable } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { uuidv7 } from "uuidv7";
import type { InitPendulumRequestDto } from "@pendulum-simulation/common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PendulumManager {
  private instances: Record<string, ChildProcess> = {};

  add(data: InitPendulumRequestDto): string {
    const { angle, length, pivotPosition } = data;
    const { x, y } = pivotPosition;
    const id = uuidv7();
    const args = [id, `${angle}`, `${length}`, `${x}`, `${y}`];
    this.instances[id] = fork(path.join(__dirname, "pendulumProc"), args);
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
