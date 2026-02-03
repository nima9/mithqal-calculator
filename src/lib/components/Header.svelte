<!--
	Header.svelte
	Site header with logo/title, navigation, theme switcher, settings, and animated underline effect.
	Includes responsive mobile menu with pixelated overlay.

	Structure:
	- Desktop: Logo | About link | Theme switcher | Settings button
	- Mobile: Logo | Menu button → Dropdown with About, Theme, Settings
-->

<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import SettingsModal from './SettingsModal.svelte';
	import Settings from './icons/Settings.svelte';
	import Menu from './icons/Menu.svelte';
	import Close from './icons/Close.svelte';

	// ============================================
	// Props
	// ============================================

	interface Props {
		currentPath?: string;
	}

	let { currentPath = '/' }: Props = $props();

	// ============================================
	// State
	// ============================================

	let isAboutPage = $derived(currentPath === '/about');
	let isSupportPage = $derived(currentPath === '/support');
	let settingsOpen = $state(false);
	let mobileMenuOpen = $state(false);

	// ============================================
	// Event Handlers
	// ============================================

	/** Close mobile menu dropdown */
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	/** Open settings modal (closes mobile menu first if open) */
	function openSettings() {
		closeMobileMenu();
		settingsOpen = true;
	}
</script>

<nav
	class="relative z-50 flex flex-wrap items-center justify-between bg-base-100 p-4 pb-20 sm:pb-24 md:pb-28 lg:pb-36"
>
	<a
		href="/"
		class="font-karla font-medium text-base-content text-4xl sm:text-4xl md:text-5xl lg:text-6xl"
	>
		<span class="link-underline">Mithqál Calculator</span>
	</a>

	<!-- Desktop Navigation (hidden on mobile) -->
	<div class="hidden items-center gap-6 sm:flex lg:gap-10">
		<a
			href="/about"
			class="font-karla text-2xl font-medium text-base-content transition-colors hover:text-primary md:text-3xl lg:text-4xl"
		>
			<span class="link-underline pb-1" class:link-active={isAboutPage}>About</span>
		</a>

		<a
			href="/support"
			class="font-karla text-2xl font-medium text-base-content transition-colors hover:text-primary md:text-3xl lg:text-4xl"
		>
			<span class="link-underline pb-1" class:link-active={isSupportPage}>Support</span>
		</a>

		<div class="flex items-center gap-2">
			<ThemeSwitcher />
			<button
				type="button"
				onclick={() => (settingsOpen = true)}
				class="btn-pixel"
				aria-label="Open settings"
			>
				<Settings size={28} />
			</button>
		</div>
	</div>

	<!-- Mobile Menu Button (visible on mobile only, invisible when menu open to preserve layout) -->
	<button
		type="button"
		onclick={() => (mobileMenuOpen = true)}
		class="btn-pixel !text-base-content sm:hidden {mobileMenuOpen ? 'invisible' : ''}"
		aria-label="Open menu"
		aria-expanded={mobileMenuOpen}
	>
		<Menu size={28} color="currentColor" />
	</button>
</nav>

<!-- Fixed Close Button (above overlay when menu is open) -->
{#if mobileMenuOpen}
	<div class="fixed right-4 top-4 z-60 sm:hidden">
		<button
			type="button"
			onclick={() => (mobileMenuOpen = false)}
			class="btn-pixel !text-base-content"
			aria-label="Close menu"
		>
			<Close size={28} color="currentColor" />
		</button>
	</div>
{/if}

<!-- Mobile Menu Dropdown -->
{#if mobileMenuOpen}
	<!-- Pixelated Overlay -->
	<button
		type="button"
		class="pixel-overlay fixed inset-0 z-55 sm:hidden"
		onclick={closeMobileMenu}
		aria-label="Close menu"
	></button>

	<!-- Menu Panel -->
	<div
		class="fixed right-4 top-16 z-60 w-48 overflow-hidden border-2 border-primary bg-base-100 sm:hidden"
		style="clip-path: polygon(
			0% 8px, 8px 8px, 8px 0%, calc(100% - 8px) 0%, calc(100% - 8px) 8px, 100% 8px,
			100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%,
			8px 100%, 8px calc(100% - 8px), 0% calc(100% - 8px)
		);"
		transition:fly={{ y: -12, duration: 200, easing: cubicOut }}
	>
		<div class="flex flex-col">
			<!-- About Link -->
			<a
				href="/about"
				onclick={closeMobileMenu}
				class="flex items-center gap-3 px-4 py-3 text-base-content transition-colors hover:bg-base-300/50 {isAboutPage
					? 'bg-primary/20'
					: ''}"
			>
				<span class="font-karla text-lg font-medium">About</span>
				{#if isAboutPage}
					<span class="ml-auto h-2 w-2 bg-primary"></span>
				{/if}
			</a>

			<div class="mx-3 h-px bg-base-300"></div>

			<!-- Support Link -->
			<a
				href="/support"
				onclick={closeMobileMenu}
				class="flex items-center gap-3 px-4 py-3 text-base-content transition-colors hover:bg-base-300/50 {isSupportPage
					? 'bg-primary/20'
					: ''}"
			>
				<span class="font-karla text-lg font-medium">Support</span>
				{#if isSupportPage}
					<span class="ml-auto h-2 w-2 bg-primary"></span>
				{/if}
			</a>

			<div class="mx-3 h-px bg-base-300"></div>

			<!-- Theme Switcher Row -->
			<ThemeSwitcher
				size={20}
				color="currentColor"
				label="Theme"
				class="flex w-full items-center gap-3 px-4 py-3 text-base-content transition-colors hover:bg-base-300/50"
			/>

			<div class="mx-3 h-px bg-base-300"></div>

			<!-- Settings -->
			<button
				type="button"
				onclick={openSettings}
				class="flex items-center gap-3 px-4 py-3 text-base-content transition-colors hover:bg-base-300/50"
			>
				<Settings size={20} />
				<span class="font-karla text-lg font-medium">Settings</span>
			</button>
		</div>
	</div>
{/if}

<SettingsModal bind:open={settingsOpen} onClose={() => (settingsOpen = false)} />

<style>
	/* Pixelated dither overlay pattern */
	.pixel-overlay {
		background-color: oklch(from var(--color-base-200) l c h / 0.6);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect x='0' y='0' width='2' height='2' fill='%23000' fill-opacity='0.15'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23000' fill-opacity='0.15'/%3E%3C/svg%3E");
		background-size: 4px 4px;
		image-rendering: pixelated;
	}

	/* Animated underline that expands on hover - GPU accelerated */
	.link-underline {
		background-image:
			linear-gradient(transparent, transparent),
			linear-gradient(var(--color-primary), var(--color-primary));
		background-size: 0 6px;
		background-position: 0 100%;
		background-repeat: no-repeat;
		transition: background-size 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		will-change: background-size;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.link-underline:hover {
		background-size: 100% 6px;
	}

	/* Active state - full underline */
	.link-active {
		background-size: 100% 6px;
	}
</style>
