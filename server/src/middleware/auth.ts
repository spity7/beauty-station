import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";
import { verifyAccessToken, type TokenPayload } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { isRefreshTokenValid } from "../services/auth.tokens.js";
import { isAccountDeleted } from "../services/user-lifecycle.js";

export type AuthenticatedRequest = Request & {
  auth?: TokenPayload;
};

async function validateAccessToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select(
      "refreshTokenVersion deletedAt isActive"
    );

    if (!user || isAccountDeleted(user) || user.isActive === false) {
      return null;
    }

    if (!isRefreshTokenValid(payload, user)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  const token = header.slice(7);
  const payload = await validateAccessToken(token);

  if (!payload) {
    next(new AppError(401, "Invalid or expired token"));
    return;
  }

  req.auth = payload;
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.auth) {
    next(new AppError(401, "Authentication required"));
    return;
  }
  if (req.auth.role !== "admin") {
    next(new AppError(403, "Admin access required"));
    return;
  }
  next();
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = header.slice(7);
  const payload = await validateAccessToken(token);
  if (payload) {
    req.auth = payload;
  }

  next();
}
