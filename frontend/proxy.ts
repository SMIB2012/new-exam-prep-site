/**
 * Legacy helper file - DEPRECATED.
 *
 * Next.js does NOT auto-run this file. Only `middleware.ts` (at project root)
 * is auto-run by Next.js for request-level interception.
 *
 * Route protection is enforced in Server Component layouts via:
 * - `app/student/layout.tsx` calls `await requireUser()`
 * - `app/admin/layout.tsx` calls `await requireRole(["ADMIN", "REVIEWER"])`
 *
 * This file exists only for backward compatibility (if any code imports from it).
 * All auth guard functions are exported from `@/lib/server/authGuard`.
 */

export * from "@/lib/server/authGuard";

