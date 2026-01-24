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

<CommandPrimitive.List
	class={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.List>
