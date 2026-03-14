import express from "express";

import type { Application, Request, Response, NextFunction } from "express";
import type { InitPendulumDto } from "@pendulum-simulation/common";
import { Pendulum } from "./pendulum.js";

const app: Application = express();

app.use(express.json());

let pendulum: Pendulum;

app.post(
  "/init",
  (req: Request<{}, {}, InitPendulumDto>, res: Response) => {
    // TODO: validate input
    const initPendulumDto = req.body;
    if (pendulum) {
      pendulum.dispose();
    }
    pendulum = new Pendulum(initPendulumDto.angle, initPendulumDto.length);
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

export default app;
