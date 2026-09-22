import { browser } from "$app/environment";
import { derived, writable } from "svelte/store";
import * as v from "valibot";

const STORAGE_KEY = "mithqal_settings";

export type WeightUnit = "grams" | "ounces";

type Settings = {
  copyWithCommas: boolean;
  weightUnit: WeightUnit;
};

const defaults: Settings = {
  copyWithCommas: true,
  weightUnit: "grams",
};

const SettingsSchema = v.object({
  copyWithCommas: v.boolean(),
  weightUnit: v.picklist(["grams", "ounces"]),
});

function getInitialSettings(): Settings {
  if (!browser) return defaults;
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return defaults;

  try {
    const parsed = v.parse(SettingsSchema, JSON.parse(stored));

    return parsed;
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
