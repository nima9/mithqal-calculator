<script lang="ts">
	import { Combobox } from 'bits-ui';
	import Check from 'lucide-svelte/icons/check';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

	interface Currency {
		code: string;
		name: string;
		symbol_native: string;
	}

	interface Props {
		currJson?: { [key: string]: Currency };
		selectedValue?: string;
		onCurrencyChange?: () => void;
	}

	let { currJson = {}, selectedValue = $bindable(''), onCurrencyChange }: Props = $props();

	let open = $state(false);
	let searchValue = $state('');
	let comboboxValue = $state<string>('');

	// Convert currJson to array for easier filtering
	let currencies = $derived(Object.values(currJson));

	// Filter currencies based on search - searches symbol, code, name, and symbol+code
	let filteredCurrencies = $derived.by(() => {
		if (!searchValue) return currencies;
		const search = searchValue.toLowerCase().trim();
		return currencies.filter((c) => {
			const symbol = c.symbol_native.toLowerCase();
			const code = c.code.toLowerCase();
			const name = c.name.toLowerCase();
			const symbolCode = `${symbol} ${code}`;
			return (
				symbol.includes(search) ||
				code.includes(search) ||
				name.includes(search) ||
				symbolCode.includes(search)
			);
		});
	});

	// Find selected currency from selectedValue prop
	let selectedCurrency = $derived.by(() => {
		if (!selectedValue) return null;
		const code = selectedValue.slice(-3).toUpperCase().trim();
		return currencies.find((c) => c.code === code) || null;
	});

	// Display value for the trigger button
	let displayValue = $derived(
		selectedCurrency
			? `${selectedCurrency.symbol_native} ${selectedCurrency.code}`
			: selectedValue || 'Select...'
	);

	// Full name for tooltip
	let currFullName = $derived(selectedCurrency?.name || '');

	// Sync comboboxValue with selectedValue on init
	$effect(() => {
		if (selectedCurrency && !comboboxValue) {
			comboboxValue = selectedCurrency.code;
		}
	});

	// Update selectedValue when combobox selection changes
	$effect(() => {
		if (comboboxValue) {
			const currency = currencies.find((c) => c.code === comboboxValue);
			if (currency) {
				const newValue = `${currency.symbol_native} ${currency.code}`;
				if (newValue !== selectedValue) {
					selectedValue = newValue;
					onCurrencyChange?.();
				}
			}
		}
	});

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			searchValue = '';
		}
	}

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		searchValue = e.currentTarget.value;
	}
</script>

<Combobox.Root type="single" bind:open bind:value={comboboxValue} onOpenChange={handleOpenChange}>
	<div class="relative">
		<Combobox.Input
			onclick={() => (open = true)}
			oninput={handleInput}
			placeholder={open ? '' : displayValue}
			class="tooltip tooltip-top my-1 w-28 cursor-pointer appearance-none border-b-4 border-green-800 bg-zinc-800 px-2 text-center text-3xl font-medium text-green-50 outline-hidden placeholder:text-green-50 focus:border-green-500 focus:placeholder:text-green-50/50 sm:w-32 sm:text-4xl md:w-40 md:border-b-8 md:text-5xl lg:w-48 lg:text-6xl"
			data-tip={currFullName}
			aria-label={displayValue}
		/>
		<Combobox.Trigger
			class="absolute right-1 top-1/2 -translate-y-1/2 text-green-50 hover:text-green-300"
		></Combobox.Trigger>
	</div>

	<Combobox.Portal>
		<Combobox.Content
			class="z-50 max-h-72 w-52 overflow-y-auto rounded-md border border-green-800 bg-zinc-800 p-1 shadow-lg"
			sideOffset={8}
		>
			{#if filteredCurrencies.length === 0}
				<div class="px-3 py-2 text-sm text-green-50/60">No currencies found.</div>
			{:else}
				{#each filteredCurrencies as currency (currency.code)}
					<Combobox.Item
						value={currency.code}
						label={`${currency.symbol_native} ${currency.code}`}
						class="flex cursor-pointer items-center rounded px-3 py-2 text-sm text-green-50 outline-hidden data-[highlighted]:bg-green-800 data-[highlighted]:text-green-50"
					>
						{#snippet children({ selected })}
							<Check class="mr-2 h-4 w-4 {selected ? 'text-green-400' : 'text-transparent'}" />
							<span>{currency.symbol_native} {currency.code}</span>
							<span class="ml-2 text-xs text-green-50/60">{currency.name}</span>
						{/snippet}
					</Combobox.Item>
				{/each}
			{/if}
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
