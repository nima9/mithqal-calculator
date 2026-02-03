<!-- Check.svelte - Pixelated checkmark icon for selected items -->
<script lang="ts">
	interface Props {
		color?: string;
		size?: string | number;
		class?: string;
	}

	let { color = 'currentColor', size = '1em', class: className = '' }: Props = $props();

	let sizeValue = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill={color}
	viewBox="0 0 24 24"
	width={sizeValue}
	height={sizeValue}
	class={className}
>
	<path
		d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z"
	/>
</svg>
