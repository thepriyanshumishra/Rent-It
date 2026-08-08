import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { AuthPayload } from '../types';
import prisma from '../db/client';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as AuthPayload;

    // Check if customer ID exists for customer role
    if (decoded.role === Role.CUSTOMER && !decoded.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { userId: decoded.userId },
        select: { id: true },
      });
      if (customer) {
        decoded.customerId = customer.id;
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(error);
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as AuthPayload;
      if (decoded.role === Role.CUSTOMER && !decoded.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { userId: decoded.userId },
          select: { id: true },
        });
        if (customer) {
          decoded.customerId = customer.id;
        }
      }
      req.user = decoded;
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
}
