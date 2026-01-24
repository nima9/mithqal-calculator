<script lang="ts">
	import { Command as CommandPrimitive } from 'cmdk-sv';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		asChild?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { asChild = false, class: className, children, ...restProps }: Props = $props();
</script>

<CommandPrimitive.Item
	{asChild}
	class={cn(
		'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Item>
