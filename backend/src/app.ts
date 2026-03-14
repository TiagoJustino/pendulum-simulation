import express from 'express';

import type {Application, Request, Response, NextFunction } from 'express';


const app: Application = express();

// 1. Basic Middleware
app.use(express.json());

// 2. Health Check Route
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'UP' });
});

// 3. Define Routes (Example)
// app.use('/api/v1/users', userRouter);

// 4. Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

export default app;
