/**
 * turnstile.remote.ts
 * Remote functions for Turnstile verification and contact email.
 *
 * About and Support share a per-tab content gate. Email disclosure always
 * requires a fresh token and is cached only after the server returns it.
 *
 * Used by:
 * - about/+page.svelte (verifyToken)
 * - support/+page.svelte (verifyToken)
 * - Footer.svelte (getEmail)
 */

import { command } from "$app/server";
import { getRequestEvent } from "$app/server";
import { Either } from "effect";
import { env } from "$env/dynamic/private";
import * as v from "valibot";
import { verifyTurnstileToken } from "$lib/utils/turnstile";

/**
 * Cloudflare's documented always-pass secret key. Local development (vite dev
 * and wrangler dev preview) points TURNSTILE_SECRET_KEY in .env at this value;
 * detecting it lets us accept the metadata-free responses it returns.
 */
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

// ============================================
// Schemas
// ============================================

const TokenSchema = v.object({
  token: v.pipe(v.string(), v.minLength(1, "Token is required")),
});

// ============================================
// Response Types
// ============================================

type VerifyResult = { success: true } | { success: false; error: string };

type EmailResult = { success: true; email: string } | { success: false; error: string };

function getAllowedHostnames(event: ReturnType<typeof getRequestEvent>): Set<string> {
  const configuredHostnames =
    event.platform?.env?.TURNSTILE_HOSTNAMES || env.TURNSTILE_HOSTNAMES || "";

  return new Set(
    configuredHostnames
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );
}

async function verifyTokenForAction(token: string, expectedAction: string): Promise<VerifyResult> {
  const event = getRequestEvent();
  const secretKey = event.platform?.env?.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET_KEY;

  if (!secretKey) return { success: false, error: "Server misconfigured" };

  let remoteIp: string | undefined;
  try {
    remoteIp = event.getClientAddress();
  } catch {
    // Some local adapters do not provide a client address.
  }

  const result = await verifyTurnstileToken({
    token,
    secretKey,
    expectedAction,
    allowedHostnames: getAllowedHostnames(event),
    remoteIp,
    allowTestResponse: secretKey === TURNSTILE_TEST_SECRET_KEY,
  });

  return Either.match(result, {
    onRight: () => ({ success: true }),
    onLeft: () => ({ success: false, error: "Verification failed. Please try again." }),
  });
}

// ============================================
// Remote Functions
// ============================================

/**
 * Verify a Turnstile token.
 * Used for human verification on About, Support pages, and Footer.
 * On success, client stores verification in sessionStorage.
 */
export const verifyToken = command(TokenSchema, async ({ token }): Promise<VerifyResult> => {
  return verifyTokenForAction(token, "content_gate");
});

/**
 * Verify a fresh contact-email token and return the address only on success.
 */
export const getEmail = command(TokenSchema, async ({ token }): Promise<EmailResult> => {
  const verification = await verifyTokenForAction(token, "contact_email");
  if (!verification.success) return verification;

  const event = getRequestEvent();
  const contactEmail = event.platform?.env?.CONTACT_EMAIL || env.CONTACT_EMAIL;

  if (!contactEmail) {
    return { success: false, error: "Server misconfigured" };
  }

  return { success: true, email: contactEmail };
});
