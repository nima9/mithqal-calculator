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
		d="M4 9V7h12V5h2v2h2v2h-2v2h-2V9H4zm12 2h-2v2h2v-2zm0-6h-2V3h2v2zm4 12v-2H8v-2h2v-2H8v2H6v2H4v2h2v2h2v2h2v-2H8v-2h12z"
	/>
</svg>
