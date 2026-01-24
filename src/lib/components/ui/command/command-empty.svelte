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

<CommandPrimitive.Empty class={cn('py-6 text-center text-sm', className)} {...restProps}>
	{@render children?.()}
</CommandPrimitive.Empty>
