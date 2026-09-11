import type { Request } from "express";
import rateLimit from "express-rate-limit";

const shouldSkipRateLimit = () =>
  Boolean(process.env.SKIP_AUTH_RATE_LIMIT) ||
  process.env.NODE_ENV === "development";

function hasBearerAuthorization(req: Request): boolean {
  const header = req.headers.authorization;
  return Boolean(header?.startsWith("Bearer "));
}

/** Login, register, password reset, and social sign-in only. */
export const credentialAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.SKIP_AUTH_RATE_LIMIT ? 10_000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts. Please try again later." },
  skip: shouldSkipRateLimit,
});

/** Anonymous catalog reads (products, categories, brands, attributes). */
export const catalogReadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.SKIP_AUTH_RATE_LIMIT ? 10_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many catalog requests. Please try again later." },
  skip: (req) => shouldSkipRateLimit() || hasBearerAuthorization(req),
});
