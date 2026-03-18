import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { PendulumManager } from "./pendulumManager.js";
import {
  validatePendulumInput,
  validateGravityInput,
  validateWindInput,
} from "./validation.js";
import type { PendulumListItemDto } from "@pendulum-simulation/common";

export function createApp(
  onRosterChange?: (pendulums: PendulumListItemDto[]) => void,
) {
  const app: Application = express();

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173", "http://localhost:4173"];
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  const manager = new PendulumManager();

  app.get("/pendulums", (_req: Request, res: Response) => {
    res.status(200).json({
      pendulums: manager.list(),
      state: manager.getState(),
    });
  });

  app.post("/add-pendulum", async (req: Request, res: Response) => {
    const result = validatePendulumInput(req.body);
    if ("error" in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    const id = manager.add(result.data);
    onRosterChange?.(manager.list());
    res.status(200).json({ id });
  });

  app.put(
    "/pendulum/:id",
    async (req: Request<{ id: string }>, res: Response) => {
      const result = validatePendulumInput(req.body);
      if ("error" in result) {
        res.status(400).json({ error: result.error });
        return;
      }
      manager.update(req.params.id, result.data);
      res.status(200).json({ success: true });
    },
  );

  app.post("/pause", (_req: Request, res: Response) => {
    manager.pauseAll();
    res.status(200).json({ success: true });
  });

  app.post("/stop", (_req: Request, res: Response) => {
    manager.stopAll();
    res.status(200).json({ success: true });
  });

  app.post("/play", (_req: Request, res: Response) => {
    manager.playAll();
    res.status(200).json({ success: true });
  });

  app.post("/gravity", (req: Request, res: Response) => {
    const result = validateGravityInput(req.body);
    if ("error" in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    manager.setGravity(result.data.gravity);
    res.status(200).json({ success: true });
  });

  app.post("/wind", (req: Request, res: Response) => {
    const result = validateWindInput(req.body);
    if ("error" in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    manager.setWind(result.data.wind);
    res.status(200).json({ success: true });
  });

  app.delete("/pendulum", async (_req: Request, res: Response) => {
    manager.shutdownAll();
    onRosterChange?.([]);
    res.status(200).json({ success: true });
  });

  app.delete(
    "/pendulum/:id",
    async (req: Request<{ id: string }>, res: Response) => {
      manager.shutdown(req.params.id);
      onRosterChange?.(manager.list());
      res.status(200).json({ success: true });
    },
  );

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });

  return app;
}
