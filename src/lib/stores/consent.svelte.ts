/**
 * consent.svelte.ts
 * Cookie consent store with localStorage persistence.
 *
 * Tracks whether user has accepted or declined analytics/advertising cookies.
 * Essential cookies (localStorage for app functionality) are always allowed.
 *
 * Values:
 * - null: User hasn't made a choice yet (show banner)
 * - true: User accepted tracking cookies
 * - false: User declined tracking cookies
 */

import { browser } from '$app/environment';

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'mithqal_cookie_consent';

// ============================================
// Store Factory
// ============================================

function createConsentStore() {
	// null = not decided, true = accepted, false = declined
	let consent = $state<boolean | null>(null);

	// Load from localStorage on init (browser only)
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) {
			consent = stored === 'true';
		}
	}

	return {
		/** Get current consent status (null = undecided) */
		get value() {
			return consent;
		},

		/** Check if user has made a decision */
		get hasDecided() {
			return consent !== null;
		},

		/** Check if tracking is allowed */
		get allowsTracking() {
			return consent === true;
		},

		/** Accept tracking cookies */
		accept() {
			consent = true;
			if (browser) {
				localStorage.setItem(STORAGE_KEY, 'true');
			}
		},

		/** Decline tracking cookies */
		decline() {
			consent = false;
			if (browser) {
				localStorage.setItem(STORAGE_KEY, 'false');
			}
		},

		/** Reset consent (for testing or if user wants to change) */
		reset() {
			consent = null;
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
		},
	};
}

// ============================================
// Export
// ============================================

export const consentStore = createConsentStore();
