/**
 * /api/verify
 * Verifies Cloudflare Turnstile token for human verification.
 *
 * Used by: about/+page.svelte (page gate)
 *
 * ============================================
 * Request
 * ============================================
 * POST /api/verify
 * Content-Type: application/json
 *
 * Body:
 * { "token": string }  // Turnstile token from client-side widget
 *
 * ============================================
 * Response
 * ============================================
 * Success (200): { "success": true }
 * Error (400):   { "success": false, "error": "Missing token" }
 * Error (403):   { "success": false, "error": "Verification failed" }
 * Error (500):   { "success": false, "error": "Server misconfigured" }
 *
 * ============================================
 * Required Environment Variables (Cloudflare)
 * ============================================
 * - TURNSTILE_SECRET_KEY: Server-side Turnstile secret key
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { verifyTurnstileToken } from "$lib/utils/turnstile";

export const POST: RequestHandler = async ({ request, platform }) => {
  const { token } = await request.json();

  if (!token) {
    return json({ success: false, error: "Missing token" }, { status: 400 });
  }

  const secretKey = platform?.env?.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return json({ success: false, error: "Server misconfigured" }, { status: 500 });
  }

  const isValid = await verifyTurnstileToken(token, secretKey);

  if (!isValid) {
    return json({ success: false, error: "Verification failed" }, { status: 403 });
  }

  return json({ success: true });
};
