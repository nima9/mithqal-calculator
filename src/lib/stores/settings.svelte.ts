import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

const STORAGE_KEY = 'mithqal_settings';

interface Settings {
	copyWithCommas: boolean;
}

const defaults: Settings = {
	copyWithCommas: true
};

function getInitialSettings(): Settings {
	if (!browser) return defaults;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return defaults;

	try {
		return { ...defaults, ...JSON.parse(stored) };
	} catch {
		return defaults;
	}
}

export const settingsStore = writable<Settings>(getInitialSettings());

if (browser) {
	settingsStore.subscribe((value) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
	});
}

export const copyWithCommas = derived(settingsStore, (settings) => settings.copyWithCommas);

export function setCopyWithCommas(value: boolean) {
	settingsStore.update((settings) => ({ ...settings, copyWithCommas: value }));
}
