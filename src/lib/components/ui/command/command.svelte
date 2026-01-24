<script lang="ts">
	import { Command as CommandPrimitive } from 'cmdk-sv';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { value = $bindable(), class: className, children, ...restProps }: Props = $props();
</script>

<CommandPrimitive.Root
	class={cn(
		'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
		className
	)}
	bind:value
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Root>
