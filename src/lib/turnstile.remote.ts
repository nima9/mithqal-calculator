/**
 * turnstile.remote.ts
 * Remote functions for Turnstile verification.
 * Replaces /api/verify and /api/contact endpoints.
 *
 * Used by:
 * - about/+page.svelte (verifyToken)
 * - support/+page.svelte (verifyToken)
 * - Footer.svelte (getContactEmail)
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

// ============================================
// Response Types
// ============================================

type VerifyResult =
  | { success: true }
  | { success: false; error: string };

type ContactResult =
  | { success: true; email: string }
  | { success: false; error: string };

// ============================================
// Remote Functions
// ============================================

/**
 * Verify a Turnstile token.
 * Used for page gates (About, Support pages).
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
 * Verify a Turnstile token and return contact email.
 * Used by Footer "Reach out" button.
 */
export const getContactEmail = command(TokenSchema, async ({ token }): Promise<ContactResult> => {
  const event = getRequestEvent();
  const secretKey = event.platform?.env?.TURNSTILE_SECRET_KEY;
  const contactEmail = event.platform?.env?.CONTACT_EMAIL;

  if (!secretKey || !contactEmail) {
    return { success: false, error: "Server misconfigured" };
  }

  const result = await verifyTurnstileToken(token, secretKey);

  return result.match(
    () => ({ success: true, email: contactEmail }),
    (error) => ({ success: false, error: error.message })
  );
});
