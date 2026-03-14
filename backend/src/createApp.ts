import type { PendulumFactory } from "./pendulumFactory.js";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { Pendulum } from "./pendulum.js";
import type { InitPendulumDto } from "@pendulum-simulation/common";
import mqtt from "mqtt";

export function createApp(pendulumFactory: PendulumFactory) {
  const app: Application = express();

  app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
  app.use(express.json());

  let pendulum: Pendulum;

  app.post(
    "/init",
    async (req: Request<{}, {}, InitPendulumDto>, res: Response) => {
      // TODO: validate input
      const initPendulumDto = req.body;
      if (pendulum) {
        pendulum.dispose();
      }
      const mqttClient = await mqtt.connectAsync("mqtt://127.0.0.1:1883");
      pendulum = pendulumFactory(
        initPendulumDto.angle,
        initPendulumDto.length,
        mqttClient,
      );
      res.status(200).json({ success: true });
    },
  );

  app.get("/position", (_req: Request, res: Response) => {
    if (!pendulum) {
      res.status(500).json({ error: "Pendulum not initialized" });
      return;
    }
    const position = pendulum.getBobPosition();
    res.status(200).json({ x: position.x, y: position.y });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });

  return app;
}
