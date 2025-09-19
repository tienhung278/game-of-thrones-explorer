import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types';
import { toErrorResponse } from '../utils/error';

export function errorHandler(err: any, _req: Request, res: Response<ApiResponse<never>>, _next: NextFunction) {
  const error = toErrorResponse(err);
  res.status(500).json(error);
}
