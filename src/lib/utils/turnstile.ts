/**
 * turnstile.ts
 * Shared Turnstile verification utilities.
 * Uses neverthrow for type-safe error handling.
 * Used by: api/contact, api/verify
 */

import { ResultAsync, err, ok } from "neverthrow";

/** Cloudflare Turnstile server-side verification endpoint */
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// ============================================
// Error Types
// ============================================

export type TurnstileErrorKind = "NETWORK_ERROR" | "VERIFICATION_FAILED" | "INVALID_RESPONSE";

export interface TurnstileError {
  kind: TurnstileErrorKind;
  message: string;
}

// ============================================
// Verification Function
// ============================================

/**
 * Verify a Turnstile token with Cloudflare's API.
 * @param token - The token from the client-side Turnstile widget
 * @param secretKey - Server-side Turnstile secret key
 * @returns ResultAsync resolving to verification success status
 */
export function verifyTurnstileToken(
  token: string,
  secretKey: string
): ResultAsync<boolean, TurnstileError> {
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);

  return ResultAsync.fromPromise(
    fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    }),
    (): TurnstileError => ({
      kind: "NETWORK_ERROR",
      message: "Failed to connect to Turnstile verification service",
    })
  )
    .andThen((response) =>
      ResultAsync.fromPromise(
        response.json(),
        (): TurnstileError => ({
          kind: "INVALID_RESPONSE",
          message: "Failed to parse Turnstile response",
        })
      )
    )
    .andThen((outcome: unknown) => {
      const result = outcome as { success?: boolean };
      if (result.success === true) {
        return ok(true);
      }
      return err<boolean, TurnstileError>({
        kind: "VERIFICATION_FAILED",
        message: "Turnstile verification failed",
      });
    });
}

/**
 * Load the Turnstile script dynamically.
 * Call this when user initiates an action requiring verification.
 * @returns Promise that resolves when script is loaded
 */
export function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.turnstile) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}
