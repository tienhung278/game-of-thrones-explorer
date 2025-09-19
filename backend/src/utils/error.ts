import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types';

export function toErrorResponse(err: unknown): ApiResponse<never> {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<any>;
    const status = ax.response?.status;
    const message = (ax.response?.data as any)?.message || ax.message || 'Upstream request failed';
    return { ok: false, error: { message, code: ax.code, status } };
  }
  if (err instanceof Error) {
    return { ok: false, error: { message: err.message } };
  }
  return { ok: false, error: { message: 'Unknown error' } };
}
