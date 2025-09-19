import express from 'express';
import cors from 'cors';
import type { ApiResponse } from './types';
import charactersRouter from './routes/characters.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

const API_PREFIX = '/api/v1';

app.use(cors());
app.use(express.json());

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.json({ ok: true, data: { status: 'healthy' } } as ApiResponse<{ status: string }>);
});

app.use(`${API_PREFIX}/characters`, charactersRouter);

app.use(errorHandler);

export default app;
