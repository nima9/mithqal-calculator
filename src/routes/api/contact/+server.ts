/**
 * /api/contact
 * Verifies Cloudflare Turnstile token and returns contact email.
 * Protects email from scrapers by requiring human verification.
 */

import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const POST: RequestHandler = async ({ request }) => {
	const { token } = await request.json();

	if (!token) {
		return json({ success: false, error: 'Missing token' }, { status: 400 });
	}

	if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_EMAIL) {
		return json({ success: false, error: 'Server misconfigured' }, { status: 500 });
	}

	// Verify token with Cloudflare
	const formData = new FormData();
	formData.append('secret', env.TURNSTILE_SECRET_KEY);
	formData.append('response', token);

	const result = await fetch(TURNSTILE_VERIFY_URL, {
		method: 'POST',
		body: formData
	});

	const outcome = await result.json();

	if (!outcome.success) {
		return json({ success: false, error: 'Verification failed' }, { status: 403 });
	}

	return json({ success: true, email: CONTACT_EMAIL });
};
