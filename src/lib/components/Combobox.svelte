<script lang="ts">
	import { tick } from 'svelte'
	import Check from 'lucide-svelte/icons/check'
	import * as Command from '$lib/components/ui/command'
	import * as Popover from '$lib/components/ui/popover'
	import { Button } from '$lib/components/ui/button'
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
	import { cn } from '$lib/utils'

	interface Currency {
		code: string
		name: string
		symbol_native: string
	}

	interface Props {
		currJson?: { [key: string]: Currency }
		selectedValue?: string
		onCurrencyChange?: () => void
	}

	let { currJson = {}, selectedValue = $bindable(''), onCurrencyChange }: Props = $props()

	let open = $state(false)
	let value = $state('')

	let foundCurrency = $derived(
		Object.values(currJson).find(
			(c) => c.symbol_native + ' ' + c.code + ' ' + c.name === value
		)
	)

	let displayValue = $derived(
		foundCurrency
			? `${foundCurrency.symbol_native} ${foundCurrency.code}`
			: selectedValue || ''
	)

	let currFullName = $derived(
		foundCurrency ? foundCurrency.name.toString() : selectedValue || ''
	)

	// Update the bindable selectedValue when a currency is found
	$effect(() => {
		if (foundCurrency) {
			selectedValue = `${foundCurrency.symbol_native} ${foundCurrency.code}`
		}
	})

	function closeAndFocusTrigger(triggerId: string) {
		open = false
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
			onCurrencyChange?.()
		})
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="sentence"
				size="sentence"
				role="combobox"
				aria-expanded={open}
				class="tooltip tooltip-top appearance-none border-b-4 border-green-800 bg-zinc-800 px-4 text-center text-green-50 outline-hidden active:border-green-500 active:ring-green-500 md:border-b-8"
				data-tip={currFullName}
				aria-label={displayValue}
			>
				<div class="my-1 text-green-50">
					{displayValue}
				</div>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="container w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search currency..." />
			<ScrollArea class="h-72 w-48 rounded-md border">
				<Command.Empty>No currencies found.</Command.Empty>
				<Command.Group>
					{#each Object.values(currJson) as c (c.code)}
						<Command.Item
							value={c.symbol_native + ' ' + c.code + ' ' + c.name}
							onSelect={(currentValue) => {
								value = currentValue
								closeAndFocusTrigger('popover-trigger')
							}}
						>
							<Check
								class={cn(
									'mr-2 h-4 w-4 ',
									value !== c.symbol_native + ' ' + c.code + ' ' + c.name && 'text-transparent'
								)}
							/>
							{c.symbol_native + ' ' + c.code}
						</Command.Item>
					{/each}
				</Command.Group>
			</ScrollArea>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
