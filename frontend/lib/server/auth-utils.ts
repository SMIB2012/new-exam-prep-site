/**
 * Authentication utilities for server-side use (proxy, API routes).
 * These utilities handle JWT decoding and token extraction without verification.
 * Note: Backend always verifies tokens for actual authorization.
 */

import type { NextRequest } from "next/server";

/**
 * JWT payload structure (decoded without verification).
 */
export interface JWTPayload {
  sub?: string;
  role?: "STUDENT" | "ADMIN" | "REVIEWER";
  exp?: number;
  type?: string;
  iat?: number;
  jti?: string;
}

/**
 * Decode JWT without verification (for routing decisions only).
 * Backend always verifies for actual authorization.
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Handle base64url encoding (JWT standard)
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract authentication tokens from request cookies.
 *
 * @param request - Next.js request object
 * @returns Object with accessToken and refreshToken (if present)
 */
export function getAuthTokens(request: NextRequest): {
  accessToken?: string;
  refreshToken?: string;
} {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Check if a route is public (no authentication required).
 *
 * @param pathname - Request pathname
 * @returns True if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    "/login",
    "/signup",
    "/",
    "/403",
    "/legal",
    "/contact",
    "/_next",
    "/static",
    "/api/auth",
  ];

  // Exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Prefix matches
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/auth")
  );
}

/**
 * Check if token is expired (based on exp claim).
 *
 * @param payload - Decoded JWT payload
 * @returns True if token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}
