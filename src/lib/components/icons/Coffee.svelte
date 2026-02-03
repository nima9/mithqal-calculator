<!-- Coffee.svelte - Pixelated coffee cup icon -->
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
		d="M7 3H5v4h2V3zm4 0H9v4h2V3zm2 0h2v4h-2V3zm8 6H3v12h14v-5h4V9zm-2 5h-2v-3h2v3zM5 11h10v8H5v-8z"
	/>
</svg>
