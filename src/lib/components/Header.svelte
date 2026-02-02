<!--
	Header.svelte
	Site header with logo/title and animated underline effect.
-->

<nav
	class="z-50 flex flex-wrap items-center justify-between bg-base-100 p-4 pb-20 sm:pb-24 md:pb-28 lg:pb-36"
>
	<a
		href="/"
		class="font-karla text-xl font-medium text-base-content sm:text-4xl md:text-5xl lg:text-6xl"
	>
		<span class="link-underline">Mithqál Calculator</span>
	</a>
</nav>

<style>
	/* Animated underline that expands on hover */
	.link-underline {
		background-image:
			linear-gradient(transparent, transparent),
			linear-gradient(var(--color-primary), var(--color-primary));
		background-size: 0 4px;
		background-position: 0 100%;
		background-repeat: no-repeat;
		transition: background-size 0.25s ease-in-out;
	}

	.link-underline:hover {
		background-size: 100% 4px;
	}
</style>
