/**
 * /api/verify
 * Verifies Cloudflare Turnstile token for human verification.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const POST: RequestHandler = async ({ request, platform }) => {
	const { token } = await request.json();

	if (!token) {
		return json({ success: false, error: 'Missing token' }, { status: 400 });
	}

	const secretKey = platform?.env?.TURNSTILE_SECRET_KEY;

	if (!secretKey) {
		return json({ success: false, error: 'Server misconfigured' }, { status: 500 });
	}

	const formData = new FormData();
	formData.append('secret', secretKey);
	formData.append('response', token);

	const result = await fetch(TURNSTILE_VERIFY_URL, {
		method: 'POST',
		body: formData
	});

	const outcome = await result.json();

	if (!outcome.success) {
		return json({ success: false, error: 'Verification failed' }, { status: 403 });
	}

	return json({ success: true });
};
