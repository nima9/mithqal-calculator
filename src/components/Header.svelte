<nav
	class="z-50 flex flex-wrap items-center justify-between bg-zinc-800 p-4 pb-20 sm:pb-24 md:pb-28 lg:pb-36"
>
	<a
		href="/"
		class="font-karla text-xl font-medium text-green-50 sm:text-4xl md:text-5xl lg:text-6xl"
	>
		<span class="link-underline link-underline-green">Mithqál Calculator</span>
	</a>
	<!-- <a
		href="/about"
		class="rounded-sm border border-green-800 bg-green-800 p-1 text-sm text-white hover:border-white hover:bg-green-700 sm:px-2 sm:py-1 sm:text-base md:px-3 md:py-2 md:text-lg"
		>About</a
	> -->
</nav>

<style>
	.link-underline {
		border-bottom-width: 0;
		background-size: 0 4px;
		background-position: 0 100%;
		background-repeat: no-repeat;
		transition: background-size 0.25s ease-in-out;
	}

	.link-underline-green {
		background-image: linear-gradient(transparent, transparent),
			linear-gradient(rgb(22 101 52), rgb(22 101 52));
	}

	.link-underline:hover {
		background-size: 100% 4px;
		background-position: 0 100%;
	}
</style>
