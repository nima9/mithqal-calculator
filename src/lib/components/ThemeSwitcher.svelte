<!--
	ThemeSwitcher.svelte
	Single button that cycles through light → system → dark theme modes.
	Persists preference in localStorage and respects system preference when in "system" mode.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import Sun from './icons/Sun.svelte';
	import Moon from './icons/Moon.svelte';
	import Monitor from './icons/Monitor.svelte';

	// ============================================
	// Props
	// ============================================

	interface Props {
		size?: number;
		color?: string;
		label?: string;
		class?: string;
	}

	let { size = 28, color, label, class: className }: Props = $props();

	// ============================================
	// Constants
	// ============================================

	type ThemeMode = 'light' | 'system' | 'dark';

	const STORAGE_KEY = 'theme-mode';
	const LIGHT_THEME = 'mithqal-light';
	const DARK_THEME = 'mithqal';
	const MODES: ThemeMode[] = ['light', 'system', 'dark'];

	// ============================================
	// State
	// ============================================

	let mode = $state<ThemeMode>('system');
	let isAnimating = $state(false);

	// ============================================
	// Derived Values
	// ============================================

	let modeLabel = $derived(
		mode === 'light' ? 'Light mode' : mode === 'dark' ? 'Dark mode' : 'System mode'
	);

	// ============================================
	// Theme Functions
	// ============================================

	/** Get the appropriate theme based on system preference */
	function getSystemTheme(): string {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		return prefersDark ? DARK_THEME : LIGHT_THEME;
	}

	/** Apply the selected theme to the document */
	function applyTheme(themeMode: ThemeMode) {
		const theme =
			themeMode === 'system' ? getSystemTheme() : themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
		document.documentElement.setAttribute('data-theme', theme);
	}

	/** Cycle to next theme mode: light → system → dark → light */
	function cycleMode() {
		isAnimating = true;
		const currentIndex = MODES.indexOf(mode);
		const nextIndex = (currentIndex + 1) % MODES.length;
		mode = MODES[nextIndex];
		localStorage.setItem(STORAGE_KEY, mode);
		applyTheme(mode);

		setTimeout(() => {
			isAnimating = false;
		}, 300);
	}

	// ============================================
	// Lifecycle
	// ============================================

	onMount(() => {
		// Load saved preference from localStorage
		const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
		if (stored && MODES.includes(stored)) {
			mode = stored;
		}
		applyTheme(mode);

		// Listen for system preference changes (only affects "system" mode)
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => {
			if (mode === 'system') {
				applyTheme('system');
			}
		};

		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	});
</script>

<button type="button" onclick={cycleMode} class={className ?? 'btn-pixel'} aria-label={modeLabel}>
	<div class="transition-transform duration-300 ease-out" class:animate-spin-once={isAnimating}>
		{#if mode === 'light'}
			<Sun {size} {color} />
		{:else if mode === 'dark'}
			<Moon {size} {color} />
		{:else}
			<Monitor {size} {color} />
		{/if}
	</div>
	{#if label}
		<span class="font-karla text-lg font-medium">{label}</span>
	{/if}
</button>

<style>
	.animate-spin-once {
		animation: spin-once 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		backface-visibility: hidden;
	}

	@keyframes spin-once {
		0% {
			transform: rotate(0deg) scale(1) translateZ(0);
		}
		50% {
			transform: rotate(180deg) scale(0.8) translateZ(0);
		}
		100% {
			transform: rotate(360deg) scale(1) translateZ(0);
		}
	}
</style>
