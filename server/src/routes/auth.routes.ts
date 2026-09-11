import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  socialAuthSchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import { env } from "../config/env.js";
import { credentialAuthRateLimiter } from "../middleware/rateLimit.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import type { UserDocument } from "../models/User.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { toUserDto } from "../utils/serializers.js";
import {
  isRefreshTokenValid,
  toTokenPayload,
} from "../services/auth.tokens.js";
import { parseActionToken, isValidObjectId } from "../services/action-token.js";
import {
  clearPasswordResetToken,
  verifyPasswordResetToken,
} from "../services/password-reset.js";
import { deliverPasswordReset } from "../services/password-reset-delivery.js";
import {
  clearEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../services/email-verification.js";
import { deliverEmailVerification } from "../services/email-verification-delivery.js";
import { verifyGoogleIdToken } from "../services/google-auth.js";
import { applyGoogleAvatar } from "../services/google-account.js";
import {
  canReactivateAccount,
  isAccountDeleted,
  reactivateAccount,
} from "../services/user-lifecycle.js";

export const authRouter = Router();

function issueAuthTokens(user: UserDocument) {
  const payload = toTokenPayload(user);

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: toUserDto(user),
  };
}

async function findActiveUserByEmail(
  email: string
): Promise<UserDocument | null> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return null;
  }

  if (isAccountDeleted(user) && !canReactivateAccount(user)) {
    return null;
  }

  return user;
}

authRouter.post(
  "/login",
  credentialAuthRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    if (isAccountDeleted(user)) {
      if (!canReactivateAccount(user)) {
        throw new AppError(401, "Invalid email or password");
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new AppError(401, "Invalid email or password");
      }

      await reactivateAccount(user);
      await clearPasswordResetToken(user);
      await user.save();
      res.json(issueAuthTokens(user));
      return;
    }

    if (user.isActive === false) {
      throw new AppError(403, "Account disabled");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password");
    }

    await clearPasswordResetToken(user);
    await user.save();

    res.json(issueAuthTokens(user));
  })
);

authRouter.post(
  "/register",
  credentialAuthRateLimiter,
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: payload.email.toLowerCase() });

    if (existing) {
      if (isAccountDeleted(existing) && canReactivateAccount(existing)) {
        existing.name = payload.name;
        existing.phone = payload.phone ?? "";
        existing.passwordHash = await bcrypt.hash(payload.password, 12);
        existing.role = "customer";
        existing.passwordSetByUser = true;
        existing.emailVerified = false;
        await reactivateAccount(existing);
        existing.refreshTokenVersion = (existing.refreshTokenVersion ?? 0) + 1;
        await deliverEmailVerification(existing);
        await existing.save();
        res.status(201).json(issueAuthTokens(existing));
        return;
      }

      if (isAccountDeleted(existing) && !canReactivateAccount(existing)) {
        await User.deleteOne({ _id: existing._id });
      } else {
        throw new AppError(409, "Email already registered");
      }
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      phone: payload.phone ?? "",
      role: "customer",
      refreshTokenVersion: 0,
      emailVerified: false,
      passwordSetByUser: true,
    });

    await deliverEmailVerification(user);
    await user.save();

    res.status(201).json(issueAuthTokens(user));
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(payload.userId);
    if (!user || isAccountDeleted(user)) {
      throw new AppError(401, "User not found");
    }

    if (!isRefreshTokenValid(payload, user)) {
      throw new AppError(401, "Refresh token has been revoked");
    }

    res.json(issueAuthTokens(user));
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.auth?.userId);
    if (!user || isAccountDeleted(user)) {
      throw new AppError(404, "User not found");
    }
    res.json(toUserDto(user));
  })
);

authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.auth?.userId);
    if (user) {
      user.refreshTokenVersion = (user.refreshTokenVersion ?? 0) + 1;
      await user.save();
    }
    res.json({ ok: true });
  })
);

authRouter.post(
  "/request-email-verification",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.auth?.userId);
    if (!user || isAccountDeleted(user)) {
      throw new AppError(404, "User not found");
    }

    if (user.emailVerified) {
      res.json({ ok: true as const });
      return;
    }

    const devToken = await deliverEmailVerification(user);
    await user.save();

    if (devToken) {
      res.json({ ok: true as const, devVerificationToken: devToken });
      return;
    }

    res.json({ ok: true as const });
  })
);

authRouter.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = verifyEmailSchema.parse(req.body);
    const parsedToken = parseActionToken(token);
    if (!parsedToken || !isValidObjectId(parsedToken.userId)) {
      throw new AppError(400, "Invalid or expired verification link");
    }

    const user = await User.findById(parsedToken.userId);
    if (!user || isAccountDeleted(user)) {
      throw new AppError(400, "Invalid or expired verification link");
    }

    if (user.emailVerified) {
      res.json(toUserDto(user));
      return;
    }

    const validToken = await verifyEmailVerificationToken(
      user,
      parsedToken.secret
    );
    if (!validToken) {
      throw new AppError(400, "Invalid or expired verification link");
    }

    user.emailVerified = true;
    await clearEmailVerificationToken(user);
    await user.save();

    res.json(toUserDto(user));
  })
);

authRouter.post(
  "/social",
  credentialAuthRateLimiter,
  asyncHandler(async (req, res) => {
    const { provider, idToken } = socialAuthSchema.parse(req.body);

    if (provider !== "google") {
      throw new AppError(400, "Only Google sign-in is supported");
    }

    const profile = await verifyGoogleIdToken(idToken);
    let user =
      (await User.findOne({ oauthProvider: "google", oauthId: profile.sub })) ??
      (await findActiveUserByEmail(profile.email));

    if (!user) {
      const passwordHash = await bcrypt.hash(
        crypto.randomBytes(32).toString("hex"),
        12
      );
      const newUser = await User.create({
        name: profile.name,
        email: profile.email,
        passwordHash,
        role: "customer",
        phone: "",
        refreshTokenVersion: 0,
        emailVerified: true,
        passwordSetByUser: false,
        oauthProvider: "google",
        oauthId: profile.sub,
      });
      applyGoogleAvatar(newUser, profile.picture);
      await newUser.save();
      res.status(201).json(issueAuthTokens(newUser));
      return;
    }

    if (isAccountDeleted(user) && canReactivateAccount(user)) {
      await reactivateAccount(user);
    } else if (isAccountDeleted(user)) {
      throw new AppError(401, "Account is deactivated");
    }

    if (user.isActive === false) {
      throw new AppError(403, "Account disabled");
    }

    user.oauthProvider = "google";
    user.oauthId = profile.sub;
    user.emailVerified = true;
    await clearEmailVerificationToken(user);
    await clearPasswordResetToken(user);
    if (!user.name) {
      user.name = profile.name;
    }
    applyGoogleAvatar(user, profile.picture);
    await user.save();

    res.json(issueAuthTokens(user));
  })
);

authRouter.post(
  "/forgot-password",
  credentialAuthRateLimiter,
  asyncHandler(async (req, res) => {
    if (env.NODE_ENV === "production" && !env.mail.isConfigured) {
      throw new AppError(
        503,
        "Password reset is temporarily unavailable. Please contact support."
      );
    }

    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await findActiveUserByEmail(email);

    if (user) {
      const devToken = await deliverPasswordReset(user);
      await user.save();

      if (devToken) {
        res.json({ ok: true as const, devResetToken: devToken });
        return;
      }
    }

    res.json({ ok: true as const });
  })
);

authRouter.post(
  "/reset-password",
  credentialAuthRateLimiter,
  asyncHandler(async (req, res) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const parsedToken = parseActionToken(token);
    if (!parsedToken || !isValidObjectId(parsedToken.userId)) {
      throw new AppError(400, "Invalid or expired reset link");
    }

    const user = await User.findById(parsedToken.userId);
    if (!user || isAccountDeleted(user)) {
      throw new AppError(400, "Invalid or expired reset link");
    }

    const validToken = await verifyPasswordResetToken(user, parsedToken.secret);
    if (!validToken) {
      throw new AppError(400, "Invalid or expired reset link");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordSetByUser = true;
    user.refreshTokenVersion = (user.refreshTokenVersion ?? 0) + 1;
    await clearPasswordResetToken(user);
    await user.save();

    res.json({ ok: true as const });
  })
);
