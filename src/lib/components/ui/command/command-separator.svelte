<script lang="ts">
	import { Command as CommandPrimitive } from 'cmdk-sv';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		[key: string]: unknown;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<CommandPrimitive.Separator class={cn('-mx-1 h-px bg-border', className)} {...restProps} />
