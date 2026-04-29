import { env } from "../config/env.js";

export const getAuthCookieOptions = () => {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: env.COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  };
};

export const clearAuthCookieOptions = () => {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
};