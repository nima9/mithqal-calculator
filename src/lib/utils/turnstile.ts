/**
 * turnstile.ts
 * Shared Turnstile verification utilities.
 * Used by: api/contact, api/verify
 */

/** Cloudflare Turnstile server-side verification endpoint */
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token with Cloudflare's API.
 * @param token - The token from the client-side Turnstile widget
 * @param secretKey - Server-side Turnstile secret key
 * @returns Promise resolving to verification success status
 */
export async function verifyTurnstileToken(token: string, secretKey: string): Promise<boolean> {
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);

  const result = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: formData,
  });

  const outcome = await result.json();
  return outcome.success === true;
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
