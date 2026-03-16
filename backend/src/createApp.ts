import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { PendulumManager } from "./pendulumManager.js";
import { validatePendulumInput } from "./validation.js";

export function createApp() {
  const app: Application = express();

  app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
  app.use(express.json());

  const manager = new PendulumManager();

  app.post("/add-pendulum", async (req: Request, res: Response) => {
    const result = validatePendulumInput(req.body);
    if ("error" in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    const id = manager.add(result.data);
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

  app.delete("/pendulum", async (_req: Request, res: Response) => {
    manager.shutdownAll();
    res.status(200).json({ success: true });
  });

  app.delete(
    "/pendulum/:id",
    async (req: Request<{ id: string }>, res: Response) => {
      manager.shutdown(req.params.id);
      res.status(200).json({ success: true });
    },
  );

  // @Deprecated in favor of mqtt
  app.get(
    "/position/:id",
    async (req: Request<{ id: string }>, res: Response) => {
      try {
        const message = await manager.getPosition(req.params.id);
        res.status(200).json(JSON.parse(message));
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Failed to get message";
        res.status(500).json({ error: msg });
      }
    },
  );

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });

  return app;
}
