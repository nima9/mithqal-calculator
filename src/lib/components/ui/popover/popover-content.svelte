<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface PopoverContentProps {
		class?: string;
		children?: Snippet;
		align?: 'start' | 'center' | 'end';
		side?: 'top' | 'right' | 'bottom' | 'left';
		sideOffset?: number;
		alignOffset?: number;
		[key: string]: unknown;
	}

	let {
		class: className,
		children,
		align = 'center',
		sideOffset = 4,
		...restProps
	}: PopoverContentProps = $props();
</script>

<PopoverPrimitive.Content
	{align}
	{sideOffset}
	class={cn(
		'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</PopoverPrimitive.Content>
