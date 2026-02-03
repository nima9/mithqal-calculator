<!-- Wallet.svelte - Pixelated wallet icon -->
<script lang="ts">
	interface Props {
		color?: string;
		size?: string | number;
	}

	let { color = 'currentColor', size = '1em' }: Props = $props();

	let sizeValue = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill={color}
	viewBox="0 0 24 24"
	width={sizeValue}
	height={sizeValue}
>
	<path
		d="M18 3H2v18h18v-4h2V7h-2V3h-2zm0 14v2H4V5h14v2h-8v10h8zm2-2h-8V9h8v6zm-4-4h-2v2h2v-2z"
	/>
</svg>
