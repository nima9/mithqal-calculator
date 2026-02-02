/**
 * settings.svelte.ts
 * Global settings store with localStorage persistence.
 */

import { browser } from "$app/environment";

const STORAGE_KEY = "mithqal_settings";

interface Settings {
  copyWithCommas: boolean;
}

const defaults: Settings = {
  copyWithCommas: true,
};

function createSettingsStore() {
  let settings = $state<Settings>(defaults);

  // Load from localStorage on init
  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        settings = { ...defaults, ...JSON.parse(stored) };
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }

  function save() {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }

  return {
    get copyWithCommas() {
      return settings.copyWithCommas;
    },
    set copyWithCommas(value: boolean) {
      settings.copyWithCommas = value;
      save();
    },
  };
}

export const settingsStore = createSettingsStore();
