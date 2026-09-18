<!--
	Combobox.svelte
	Currency selector dropdown with search functionality.
	Searches by symbol, code, name, or symbol+code combination.
-->

<script lang="ts">
	import { Combobox } from 'bits-ui';
	import Check from './icons/Check.svelte';

	// ============================================
	// Types
	// ============================================

	interface Currency {
		code: string;
		name: string;
		symbol_native: string;
		kind: 'fiat' | 'crypto';
	}

	interface Props {
		currJson?: Record<string, Currency>;
		selectedValue?: string;
		onCurrencyChange?: () => void;
	}

	// ============================================
	// Props & State
	// ============================================

	let { currJson = {}, selectedValue = $bindable(''), onCurrencyChange }: Props = $props();

	let open = $state(false);
	let searchValue = $state('');
	let comboboxValue = $state('');

	// ============================================
	// Derived Values
	// ============================================

	// Convert object to array for filtering
	let currencies = $derived(Object.values(currJson));

	// Filter currencies based on search input
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

	let groupedCurrencies = $derived.by(() => [
		{
			label: 'Fiat currencies',
			items: filteredCurrencies.filter((currency) => currency.kind === 'fiat')
		},
		{
			label: 'Cryptocurrencies',
			items: filteredCurrencies.filter((currency) => currency.kind === 'crypto')
		}
	]);

	// Extract selected currency from the selectedValue prop (format: "$ USD")
	let selectedCurrency = $derived.by(() => {
		if (!selectedValue) return null;
		const code = selectedValue.slice(-3).toUpperCase().trim();
		return currencies.find((c) => c.code === code) || null;
	});

	// Display text showing symbol + code (e.g., "$ USD")
	let displayValue = $derived(
		selectedCurrency ? formatCurrencyLabel(selectedCurrency) : selectedValue || 'Select...'
	);

	// Full currency name for tooltip
	let currFullName = $derived(selectedCurrency?.name || '');

	// Dynamic width based on text length (minimum 5ch)
	let inputWidth = $derived(Math.max(5, displayValue.length + 1));

	// ============================================
	// Effects
	// ============================================

	// Sync internal combobox value with external selectedValue on init
	$effect(() => {
		if (selectedCurrency && !comboboxValue) {
			comboboxValue = selectedCurrency.code;
		}
	});

	// Update external selectedValue when user makes a selection
	$effect(() => {
		if (!comboboxValue) return;

		const currency = currencies.find((c) => c.code === comboboxValue);
		if (currency) {
			const newValue = formatCurrencyLabel(currency);
			if (newValue !== selectedValue) {
				selectedValue = newValue;
				onCurrencyChange?.();
			}
		}
	});

	// ============================================
	// Event Handlers
	// ============================================

	function formatCurrencyLabel(currency: Currency): string {
		return [currency.symbol_native, currency.code].filter(Boolean).join(' ');
	}

	/** Handle dropdown open/close and clear search on close */
	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			searchValue = '';
		}
	}

	/** Update search value as user types */
	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		searchValue = e.currentTarget.value;
	}
</script>

<Combobox.Root type="single" bind:open bind:value={comboboxValue} onOpenChange={handleOpenChange}>
	<div class="relative">
		<!-- Currency Input/Trigger -->
		<Combobox.Input
			onclick={() => (open = true)}
			oninput={handleInput}
			placeholder={open ? '' : displayValue}
			style="width: {inputWidth}ch;"
			class="input-underline tooltip tooltip-top mb-1 cursor-pointer appearance-none bg-base-100 px-2 pb-1 text-center text-3xl font-medium text-base-content outline-hidden placeholder:text-base-content focus:placeholder:text-base-content/50 sm:text-4xl md:pb-2 md:text-5xl lg:text-6xl"
			data-tip={currFullName}
			aria-label={displayValue}
		/>

		<Combobox.Trigger
			class="absolute right-1 top-1/2 -translate-y-1/2 text-base-content hover:text-secondary"
		/>
	</div>

	<!-- Dropdown Content -->
	<Combobox.Portal>
		<Combobox.Content
			class="z-50 max-h-72 w-52 overflow-y-auto rounded-box border border-primary bg-base-100 p-1 shadow-lg"
			sideOffset={8}
		>
			{#if filteredCurrencies.length === 0}
				<div class="px-3 py-2 text-sm text-base-content/60">No currencies found.</div>
			{:else}
				{#each groupedCurrencies as group (group.label)}
					{#if group.items.length > 0}
						<div class="px-3 pt-2 pb-1 text-xs font-semibold text-base-content/50">
							{group.label}
						</div>
						{#each group.items as currency (currency.code)}
							<Combobox.Item
								value={currency.code}
								label={formatCurrencyLabel(currency)}
								class="flex cursor-pointer items-center rounded px-3 py-2 text-sm text-base-content outline-hidden data-highlighted:bg-primary data-highlighted:text-primary-content"
							>
								{#snippet children({ selected })}
									<Check class="mr-2 h-6 w-6 {selected ? 'text-accent' : 'text-transparent'}" />
									<span>{formatCurrencyLabel(currency)}</span>
									{#if currency.name}
										<span class="ml-2 text-xs text-base-content/60">{currency.name}</span>
									{/if}
								{/snippet}
							</Combobox.Item>
						{/each}
					{/if}
				{/each}
			{/if}
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
