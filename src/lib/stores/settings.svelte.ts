import { browser } from "$app/environment";
import { derived, writable } from "svelte/store";

const STORAGE_KEY = "mithqal_settings";

export type WeightUnit = "grams" | "ounces";

interface Settings {
  copyWithCommas: boolean;
  weightUnit: WeightUnit;
}

const defaults: Settings = {
  copyWithCommas: true,
  weightUnit: "grams",
};

function getInitialSettings(): Settings {
  if (!browser) return defaults;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaults;

  try {
    const parsed = JSON.parse(stored) as Partial<Settings>;
    return {
      copyWithCommas:
        typeof parsed.copyWithCommas === "boolean"
          ? parsed.copyWithCommas
          : defaults.copyWithCommas,
      weightUnit: parsed.weightUnit === "ounces" ? "ounces" : "grams",
    };
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
export const weightUnit = derived(settingsStore, (settings) => settings.weightUnit);

export function setCopyWithCommas(value: boolean) {
  settingsStore.update((settings) => ({ ...settings, copyWithCommas: value }));
}

export function setWeightUnit(value: WeightUnit) {
  settingsStore.update((settings) => ({ ...settings, weightUnit: value }));
}
