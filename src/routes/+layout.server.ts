/**
 * +layout.server.ts
 * Server-side layout to detect user's country from Cloudflare headers.
 * Used for GDPR cookie consent banner targeting.
 */

import type { LayoutServerLoad } from './$types';

// EU countries + UK + Switzerland (require cookie consent)
const CONSENT_REQUIRED_COUNTRIES = new Set([
	// EU Member States
	'AT', // Austria
	'BE', // Belgium
	'BG', // Bulgaria
	'HR', // Croatia
	'CY', // Cyprus
	'CZ', // Czechia
	'DK', // Denmark
	'EE', // Estonia
	'FI', // Finland
	'FR', // France
	'DE', // Germany
	'GR', // Greece
	'HU', // Hungary
	'IE', // Ireland
	'IT', // Italy
	'LV', // Latvia
	'LT', // Lithuania
	'LU', // Luxembourg
	'MT', // Malta
	'NL', // Netherlands
	'PL', // Poland
	'PT', // Portugal
	'RO', // Romania
	'SK', // Slovakia
	'SI', // Slovenia
	'ES', // Spain
	'SE', // Sweden
	// Non-EU but GDPR-like
	'GB', // United Kingdom
	'CH', // Switzerland
]);

export const load: LayoutServerLoad = async ({ request }) => {
	// Cloudflare provides the country code in this header
	const country = request.headers.get('cf-ipcountry') || '';
	const requiresConsent = CONSENT_REQUIRED_COUNTRIES.has(country);

	return {
		requiresConsent,
		country,
	};
};
