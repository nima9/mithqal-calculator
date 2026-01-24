<script lang="ts">
	import metalData from '$lib/data/metals.json'
	import currencyData from '$lib/data/currencies.json'
	import CurrencyCombobox from './Combobox.svelte'

	const mithqalWeightInOunces = 0.11708222222 // 1 mithqal in troy ounces

	// Props
	let { selectedCurrency = $bindable('$ USD') }: { selectedCurrency?: string } = $props()

	// State
	let mithqalAmount = $state('19')
	let selectedMetal = $state('Gold')
	let copyTooltipText = $state('Click to copy')

	// Date constants
	const metalRateDate = new Date(metalData.timestamps.metal.toString())
	const currencyRateDate = new Date(metalData.timestamps.currency.toString())

	const dateDisplayOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZone: 'America/Los_Angeles',
		timeZoneName: 'short'
	}

	const readableMetalRateDate = new Intl.DateTimeFormat('en-US', dateDisplayOptions).format(
		metalRateDate
	)
	const readableCurrencyRateDate = new Intl.DateTimeFormat('en-US', dateDisplayOptions).format(
		currencyRateDate
	)

	// Derived values for calculation
	let calculatedValue = $derived.by(() => {
		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim()
		const metalRate = metalData.metals[selectedMetal.toLowerCase().trim() as keyof typeof metalData.metals]
		const currencyRate = metalData.currencies[currencyCode as keyof typeof metalData.currencies]
		const amount = parseFloat(mithqalAmount) || 0
		const calculation = mithqalWeightInOunces * amount * (metalRate / currencyRate)
		return calculation
	})

	let formattedCalculatedValue = $derived(
		calculatedValue
			.toFixed(2)
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	)

	let displayCalculatedValue = $derived.by(() => {
		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim()
		const currencyInfo = currencyData[currencyCode as keyof typeof currencyData]
		const currencySymbol = currencyInfo?.symbol_native ?? '$'
		return isNaN(calculatedValue) ? '' : currencySymbol + ' ' + formattedCalculatedValue
	})

	let mithqalLabel = $derived(parseFloat(mithqalAmount) > 1 ? 'Mithqals' : 'Mithqal')

	// Event handlers
	function sanitizeInput(event: Event) {
		const target = event.target as HTMLInputElement
		const inputValue = target.value
		const validValue = inputValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
		if (inputValue !== validValue) {
			mithqalAmount = validValue
		}
	}

	function handleInput(event: Event) {
		sanitizeInput(event)
		const target = event.target as HTMLInputElement
		target.style.width = target.value.length + 1 + 'ch'
	}

	function switchSelectedMetal() {
		selectedMetal = selectedMetal === 'Gold' ? 'Silver' : 'Gold'
	}

	function handleCopyClick() {
		navigator.clipboard.writeText(formattedCalculatedValue)
		copyTooltipText = 'Copied!'
	}

	function handleCopyMouseLeave() {
		setTimeout(() => {
			copyTooltipText = 'Click to copy'
		}, 300)
	}

	function handleCurrencyChange() {
		// Callback for when currency changes in the combobox
		// The calculation will automatically update via $derived
	}
</script>

<div
	class="flex appearance-none flex-wrap items-center justify-center space-x-0 bg-zinc-800 text-3xl font-medium text-green-50 sm:text-4xl md:mx-auto md:text-5xl lg:text-6xl"
>
	<form>
		<input
			autocomplete="off"
			type="text"
			bind:value={mithqalAmount}
			oninput={handleInput}
			class="my-1 w-14 appearance-none flex-wrap items-center justify-center border-b-4 border-green-800 bg-zinc-800 text-center text-green-50 outline-hidden focus:border-green-500 focus:ring-green-500 sm:w-14 md:w-20 md:border-b-8 lg:w-24"
			id="mithqalAmount"
			name="mithqalAmount"
		/>

		<label
			for="mithqalAmount"
			class="flex-warp tooltip pr-4 font-medium text-green-50"
			data-tip="1 Mithqal = 3.642g"
		>
			{mithqalLabel} of
		</label>
	</form>

	<button
		autocomplete="off"
		class="appearance-none border-b-4 border-green-800 bg-zinc-800 px-4 text-center text-green-50 outline-hidden active:border-green-500 active:ring-green-500 md:border-b-8"
		onclick={switchSelectedMetal}
	>
		<div class="my-1">{selectedMetal}</div>
	</button>
	<div class="px-4">in</div>
	<CurrencyCombobox
		currJson={currencyData}
		bind:selectedValue={selectedCurrency}
		onCurrencyChange={handleCurrencyChange}
	/>
</div>

<br />
<div
	class="flex flex-wrap items-center justify-center pb-9 pt-16 text-6xl text-green-300 sm:text-7xl md:text-8xl lg:text-9xl"
>
	<button
		class="tooltip tooltip-bottom hover:bg-transparent"
		data-tip={copyTooltipText}
		onclick={handleCopyClick}
		onmouseleave={handleCopyMouseLeave}
	>
		{displayCalculatedValue}
	</button>
</div>

<div
	class="flex flex-wrap items-center justify-end px-7 pb-1 pt-24 text-gray-400 sm:mr-48 md:mr-24 lg:mr-12"
>
	Metal rates as of: {readableMetalRateDate}
</div>
<div
	class="flex flex-wrap items-center justify-end px-7 py-1 text-gray-400 sm:mr-48 md:mr-24 lg:mr-12"
>
	Currency rates as of: {readableCurrencyRateDate}
</div>
