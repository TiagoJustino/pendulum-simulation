import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import type { InitPendulumDto } from "@pendulum-simulation/common";
import { uuidv7 } from "uuidv7";
import { fork } from "child_process";
import type { ChildProcess, Serializable } from "node:child_process";

async function getFirstMessage(child: ChildProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    // Resolve on the first message
    child.once("message", (message: Serializable) => {
      resolve(message.toString());
    });

    // Reject if the child encounters an error
    child.on("error", (err) => {
      reject(err);
    });

    // Reject if the child exits before sending a message
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Child exited with code ${code}`));
      }
    });
  });
}

const script = process.env.npm_lifecycle_script?.split(" ").pop();
const scriptParts = script?.split("/");
scriptParts?.pop();
const scriptDir = scriptParts?.join("/");

export function createApp() {
  const app: Application = express();

  app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
  app.use(express.json());

  const instances: Record<string, ChildProcess> = {};

  app.post(
    "/init",
    async (req: Request<{}, {}, InitPendulumDto>, res: Response) => {
      // TODO: validate input
      const initPendulumDto = req.body;
      const id = uuidv7();
      const args = [initPendulumDto.angle, initPendulumDto.length].map(
        (v) => `${v}`,
      );
      // instances[id] = fork(`./src/pendulumProc.${isTsx ? "ts" : "js"}`, args);
      instances[id] = fork([".", scriptDir, "pendulumProc"].join("/"), args);
      // TODO:
      // call instances[id].send({ command: 'SHUTDOWN' }) for finishing child process
      res.status(200).json({ success: true });
    },
  );

  // Deprecated in favor of mqtt
  app.get(
    "/position/:id",
    async (req: Request<{ id: string }>, res: Response) => {
      const id = req.params.id;
      const pendulum = instances[id];
      if (!pendulum) {
        res.status(500).json({ error: "Pendulum not initialized" });
        return;
      }
      pendulum.send({ command: "POSITION" });

      try {
        const message: string = await getFirstMessage(pendulum);
        res.status(200).json(JSON.parse(message));
      } catch (error) {
        console.error("Failed to get message:", error);
        res.status(500).json({ error: "Failed to get message" });
      }
    },
  );

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });

  return app;
}
