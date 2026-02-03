/**
 * settings.svelte.ts
 * Global settings store with localStorage persistence.
 *
 * Settings are loaded from localStorage on initialization and
 * automatically saved whenever a setting is changed.
 *
 * Available Settings:
 * - copyWithCommas: Whether to include commas when copying values (default: true)
 */

import { browser } from "$app/environment";

// ============================================
// Constants
// ============================================

const STORAGE_KEY = "mithqal_settings";

// ============================================
// Types
// ============================================

interface Settings {
  copyWithCommas: boolean;
}

// ============================================
// Defaults
// ============================================

const defaults: Settings = {
  copyWithCommas: true,
};

// ============================================
// Store Factory
// ============================================

/**
 * Creates a reactive settings store with localStorage persistence.
 * Uses Svelte 5 $state rune for reactivity.
 */
function createSettingsStore() {
  let settings = $state<Settings>(defaults);

  // Load from localStorage on init (browser only)
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

  /** Persist current settings to localStorage */
  function save() {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }

  // Return reactive getters/setters that auto-save on change
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

// ============================================
// Export
// ============================================

export const settingsStore = createSettingsStore();
