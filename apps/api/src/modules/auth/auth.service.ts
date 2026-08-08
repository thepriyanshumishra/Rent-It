import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../../db/client';
import { config } from '../../config';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthPayload } from '../../types';

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await argon2.hash(input.password);
    const role = input.role || Role.CUSTOMER;

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          role,
        },
      });

      if (role === Role.CUSTOMER) {
        await tx.customer.create({
          data: {
            userId: newUser.id,
            name: input.name,
            phone: input.phone,
            cart: {
              create: {},
            },
          },
        });
      }

      return newUser;
    });

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
      select: { id: true, name: true, phone: true },
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      customerId: customer?.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        customer,
      },
      tokens,
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        customer: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const validPassword = await argon2.verify(user.passwordHash, input.password);
    if (!validPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customer?.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        customer: user.customer
          ? {
              id: user.customer.id,
              name: user.customer.name,
              phone: user.customer.phone,
            }
          : null,
      },
      tokens,
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as AuthPayload;

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: { include: { customer: true } } },
      });

      if (!storedToken || storedToken.expiresAt < new Date() || !storedToken.user.isActive) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // Delete used refresh token (rotation)
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      const newTokens = await this.generateTokens({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
        customerId: storedToken.user.customer?.id,
      });

      return newTokens;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static async logout(refreshToken: string) {
    try {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    } catch {
      // Ignore if already deleted
    }
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }

  private static async generateTokens(payload: AuthPayload) {
    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ userId: payload.userId }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
    });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
