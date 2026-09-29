import express, { Router } from 'express';
import { handleVerify } from './routes/verifyRoute.ts';

export const apiRouter = Router();

apiRouter.use(express.json());

apiRouter.post('/verify', handleVerify);

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'diagnostic_core_active' });
});
