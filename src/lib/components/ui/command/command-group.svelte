<script lang="ts">
	import { Command as CommandPrimitive } from 'cmdk-sv';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<CommandPrimitive.Group
	class={cn(
		'overflow-hidden p-1 text-foreground **:data-cmdk-group-heading:px-2 **:data-cmdk-group-heading:py-1.5 **:data-cmdk-group-heading:text-xs **:data-cmdk-group-heading:font-medium **:data-cmdk-group-heading:text-muted-foreground',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Group>
