import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

const STORAGE_KEY = 'mithqal_cookie_consent';
type ConsentValue = boolean | null;

function getInitialConsent(): ConsentValue {
	if (!browser) return null;
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) {
			return stored === 'true';
		}
	}
	return null;
}

export const consentStore = writable<ConsentValue>(getInitialConsent());

if (browser) {
	consentStore.subscribe((value) => {
		if (value === null) {
			localStorage.removeItem(STORAGE_KEY);
			return;
		}
		localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
	});
}

export const hasDecided = derived(consentStore, (consent) => consent !== null);
export const allowsTracking = derived(consentStore, (consent) => consent === true);

export function acceptConsent() {
	consentStore.set(true);
}

export function declineConsent() {
	consentStore.set(false);
}

export function resetConsent() {
	consentStore.set(null);
}
