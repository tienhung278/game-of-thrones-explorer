import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const THRONES_API_BASE = (process.env.THRONES_API_BASE || 'https://thronesapi.com').replace(/\/$/, '');

export const DEFAULT_TIMEOUT_MS = 10_000;
