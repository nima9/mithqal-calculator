<!--
	Header.svelte
	Site header with logo/title, navigation, theme switcher, and animated underline effect.
-->

<script lang="ts">
	import ThemeSwitcher from './ThemeSwitcher.svelte';

	interface Props {
		currentPath?: string;
	}

	let { currentPath = '/' }: Props = $props();

	let isAboutPage = $derived(currentPath === '/about');
</script>

<nav
	class="z-50 flex flex-wrap items-center justify-between bg-base-100 p-4 pb-20 sm:pb-24 md:pb-28 lg:pb-36"
>
	<a
		href="/"
		class="font-karla text-xl font-medium text-base-content sm:text-4xl md:text-5xl lg:text-6xl"
	>
		<span class="link-underline">Mithqál Calculator</span>
	</a>

	<div class="flex items-center gap-4 sm:gap-6">
		<a
			href="/about"
			class="font-karla text-lg font-medium text-base-content sm:text-xl md:text-2xl"
		>
			<span class="link-underline" class:link-active={isAboutPage}>About</span>
		</a>

		<ThemeSwitcher />
	</div>
</nav>

<style>
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
