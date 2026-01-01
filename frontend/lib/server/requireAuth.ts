/**
 * Server-side authentication utilities for Next.js Server Components.
 * Used in layouts to protect routes.
 *
 * This file re-exports functions from authGuard.ts for backward compatibility.
 * New code should import directly from authGuard.ts.
 */

// Re-export everything from authGuard
export {
  type User,
  getUser,
  requireUser,
  requireRole,
  redirectIfAuthed,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "./authGuard";

