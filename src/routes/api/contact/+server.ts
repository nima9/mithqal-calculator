/**
 * /api/contact
 * Verifies Cloudflare Turnstile token and returns contact email.
 * Protects email from scrapers/bots by requiring human verification.
 *
 * Used by: Footer.svelte "Reach Out" button
 *
 * ============================================
 * Request
 * ============================================
 * POST /api/contact
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "token": string  // Turnstile token from client-side widget
 * }
 *
 * ============================================
 * Response
 * ============================================
 * Success (200):
 * {
 *   "success": true,
 *   "email": "contact@example.com"  // The protected contact email
 * }
 *
 * Error - Missing token (400):
 * { "success": false, "error": "Missing token" }
 *
 * Error - Server misconfigured (500):
 * { "success": false, "error": "Server misconfigured" }
 *
 * Error - Verification failed (403):
 * { "success": false, "error": "Verification failed" }
 *
 * ============================================
 * Required Environment Variables (Cloudflare)
 * ============================================
 * - TURNSTILE_SECRET_KEY: Server-side Turnstile secret key
 * - CONTACT_EMAIL: The email address to return after verification
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ============================================
// Configuration
// ============================================

/** Cloudflare Turnstile server-side verification endpoint */
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// ============================================
// Handler
// ============================================

export const POST: RequestHandler = async ({ request, platform }) => {
	// Extract Turnstile token from request body
	const { token } = await request.json();

	if (!token) {
		return json({ success: false, error: 'Missing token' }, { status: 400 });
	}

	// Get secrets from Cloudflare Workers platform environment
	// These are set in the Cloudflare dashboard under Workers > Settings > Variables
	const secretKey = platform?.env?.TURNSTILE_SECRET_KEY;
	const contactEmail = platform?.env?.CONTACT_EMAIL;

	if (!secretKey || !contactEmail) {
		return json({ success: false, error: 'Server misconfigured' }, { status: 500 });
	}

	// Verify token with Cloudflare Turnstile API
	// Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
	const formData = new FormData();
	formData.append('secret', secretKey); // Server-side secret key
	formData.append('response', token); // Token from client widget

	const result = await fetch(TURNSTILE_VERIFY_URL, {
		method: 'POST',
		body: formData
	});

	const outcome = await result.json();

	// Turnstile returns { success: true/false, ... }
	if (!outcome.success) {
		return json({ success: false, error: 'Verification failed' }, { status: 403 });
	}

	// Human verified - return the protected email
	return json({ success: true, email: contactEmail });
};
