import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { config } from '../config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  if (config.NODE_ENV === 'development') {
    console.error('💥 Error caught in handler:', err);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code);
  }

  // Handle Prisma unique constraint error
  if (err.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2002') {
    const target = (err as any).meta?.target?.join(', ') || 'field';
    return sendError(res, `A record with this ${target} already exists.`, 409, 'DUPLICATE_RECORD');
  }

  return sendError(
    res,
    config.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500,
    'INTERNAL_SERVER_ERROR',
  );
}
