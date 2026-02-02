<!--
	ThemeSwitcher.svelte
	Single button that cycles through light/system/dark theme modes.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import Sun from './icons/Sun.svelte';
	import Moon from './icons/Moon.svelte';
	import Monitor from './icons/Monitor.svelte';

	type ThemeMode = 'light' | 'system' | 'dark';

	const STORAGE_KEY = 'theme-mode';
	const LIGHT_THEME = 'mithqal-light';
	const DARK_THEME = 'mithqal';
	const MODES: ThemeMode[] = ['light', 'system', 'dark'];

	let mode = $state<ThemeMode>('system');
	let isAnimating = $state(false);

	function getSystemTheme(): string {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		return prefersDark ? DARK_THEME : LIGHT_THEME;
	}

	function applyTheme(themeMode: ThemeMode) {
		const theme = themeMode === 'system' ? getSystemTheme() : themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
		document.documentElement.setAttribute('data-theme', theme);
	}

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

	let modeLabel = $derived(
		mode === 'light' ? 'Light mode' : mode === 'dark' ? 'Dark mode' : 'System mode'
	);

	onMount(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
		if (stored && MODES.includes(stored)) {
			mode = stored;
		}
		applyTheme(mode);

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

<button
	type="button"
	onclick={cycleMode}
	class="rounded-full p-2 text-base-content/70 transition-colors hover:bg-base-300/50 hover:text-base-content"
	aria-label={modeLabel}
>
	<div
		class="transition-transform duration-300 ease-out"
		class:animate-spin-once={isAnimating}
	>
		{#if mode === 'light'}
			<Sun size={22} />
		{:else if mode === 'dark'}
			<Moon size={22} />
		{:else}
			<Monitor size={22} />
		{/if}
	</div>
</button>

<style>
	.animate-spin-once {
		animation: spin-once 0.3s ease-out;
	}

	@keyframes spin-once {
		0% {
			transform: rotate(0deg) scale(1);
		}
		50% {
			transform: rotate(180deg) scale(0.8);
		}
		100% {
			transform: rotate(360deg) scale(1);
		}
	}
</style>
