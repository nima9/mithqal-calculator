/**
 * turnstile.remote.ts
 * Remote functions for Turnstile verification and contact email.
 *
 * Verification is shared across About, Support pages, and Footer.
 * Once verified (stored in sessionStorage), Turnstile is skipped.
 *
 * Used by:
 * - about/+page.svelte (verifyToken)
 * - support/+page.svelte (verifyToken)
 * - Footer.svelte (verifyToken, getEmail)
 */

import { command } from "$app/server";
import { getRequestEvent } from "$app/server";
import { z } from "zod";
import { verifyTurnstileToken } from "$lib/utils/turnstile";

// ============================================
// Schemas
// ============================================

const TokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Empty schema for functions that don't need arguments
const EmptySchema = z.object({});

// ============================================
// Response Types
// ============================================

type VerifyResult =
  | { success: true }
  | { success: false; error: string };

type EmailResult =
  | { success: true; email: string }
  | { success: false; error: string };

// ============================================
// Remote Functions
// ============================================

/**
 * Verify a Turnstile token.
 * Used for human verification on About, Support pages, and Footer.
 * On success, client stores verification in sessionStorage.
 */
export const verifyToken = command(TokenSchema, async ({ token }): Promise<VerifyResult> => {
  const event = getRequestEvent();
  const secretKey = event.platform?.env?.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return { success: false, error: "Server misconfigured" };
  }

  const result = await verifyTurnstileToken(token, secretKey);

  return result.match(
    () => ({ success: true }),
    (error) => ({ success: false, error: error.message })
  );
});

/**
 * Get contact email from server.
 * Called after verification is confirmed (via sessionStorage).
 * No Turnstile token required - verification already done.
 */
export const getEmail = command(EmptySchema, async (): Promise<EmailResult> => {
  const event = getRequestEvent();
  const contactEmail = event.platform?.env?.CONTACT_EMAIL;

  if (!contactEmail) {
    return { success: false, error: "Server misconfigured" };
  }

  return { success: true, email: contactEmail };
});
