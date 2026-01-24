<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '.';

	type Variant = 'default' | 'destructive' | 'outline-solid' | 'secondary' | 'ghost' | 'link' | 'sentence';
	type Size = 'default' | 'sm' | 'lg' | 'icon' | 'sentence';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'default',
		size = 'default',
		children,
		class: className,
		...restProps
	}: Props = $props();
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...restProps}
>
	{@render children?.()}
</ButtonPrimitive.Root>
