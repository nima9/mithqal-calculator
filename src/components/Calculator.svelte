<script lang="ts">
	import metalData from '../api/metals.json'
	import currencyData from '../api/currencies.json'
	import CurrencyCombobox from './Combobox.svelte'

	const mithqalWeightInOunces = 0.11708222222 //1 mithqal in troy ounces
	let mithqalAmount = '19' //number of mithqals
	let selectedMetal = 'Gold' //type of metal (Gold or Silver, default value is Gold)
	export let selectedCurrency = '$ USD' //default currency is USD
	let calculatedValue = 0 //result of the calculation (in float)
	let displayCalculatedValue = '' //the string to display the result (with currency symbol)
	let metalRateDate = new Date(metalData.timestamps.metal.toString()) //date of the metal rates
	let currencyRateDate = new Date(metalData.timestamps.currency.toString()) //date of the currency rates
	$: copyTooltipText = 'Click to copy'

	function sanitizeInput(event) {
		const inputValue = event.target.value
		const validValue = inputValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
		if (inputValue !== validValue) {
			mithqalAmount = validValue
		}
	}

	const calculateValue = () => {
		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim()
		const currencyDataEntry = currencyData[currencyCode as keyof typeof currencyData]
		const currencySymbol = currencyDataEntry ? currencyDataEntry.symbol_native : ''
		const metalKey = selectedMetal.toLowerCase().trim() as keyof typeof metalData.metals
		const metalRate = metalData.metals[metalKey] ?? 0
		const currencyRate =
			metalData.currencies[currencyCode as keyof typeof metalData.currencies] ?? 1
		const parsedMithqalAmount = parseFloat(mithqalAmount)
		const calculation =
			mithqalWeightInOunces *
			(isNaN(parsedMithqalAmount) ? 0 : parsedMithqalAmount) *
			(currencyRate !== 0 ? metalRate / currencyRate : 0)
		calculatedValue = Number.isFinite(calculation) ? calculation : 0

		const formattedValue = calculatedValue
			.toFixed(2)
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

		displayCalculatedValue = isNaN(calculation) ? '' : currencySymbol + ' ' + formattedValue
	}

	const dateDisplayOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZone: 'America/Los_Angeles',
		timeZoneName: 'short',
	}

	function switchSelectedMetal() {
		selectedMetal = selectedMetal === 'Gold' ? 'Silver' : 'Gold'
	}
	calculateValue()

	const readableMetalRateDate = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZone: 'America/Los_Angeles',
		timeZoneName: 'short',
	}).format(metalRateDate)

	const readableCurrencyRateDate = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZone: 'America/Los_Angeles',
		timeZoneName: 'short',
	}).format(currencyRateDate)

	function toFixed(arg0: number) {
		throw new Error('Function not implemented.')
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
			on:input={sanitizeInput}
			on:input={calculateValue}
			class="my-1 w-14 appearance-none flex-wrap items-center justify-center border-b-4 border-green-800 bg-zinc-800 text-center text-green-50 outline-hidden focus:border-green-500 focus:ring-green-500 sm:w-14 md:w-20 md:border-b-8 lg:w-24"
			id="mithqalAmount"
			name="mithqalAmount"
			on:input={(e) => {
				const target = e.target as HTMLInputElement;
				if (target) {
					target.style.width = (target.value.length + 1) + 'ch';
				}
			}}
		/>

		<label
			for="mithqalAmount"
			class="tooltip flex-wrap pr-4 font-medium text-green-50"
			data-tip="1 Mithqál = 3.642g"
			>{#if Number(mithqalAmount) > 1}
				Mithqáls
			{:else}
				Mithqál
			{/if} of
		</label>
	</form>

	<button
		class="appearance-none border-b-4 border-green-800 bg-zinc-800 px-4 text-center text-green-50 outline-hidden active:border-green-500 active:ring-green-500 md:border-b-8"
		type="button"
		on:click={() => {
			switchSelectedMetal()
			calculateValue()
		}}
	>
		>
		<div class="my-1">{selectedMetal}</div>
	</button>
	<div class="px-4">in</div>
	<CurrencyCombobox
		currJson={currencyData}
		bind:selectedValue={selectedCurrency}
		on:listenToMe={calculateValue}
	/>
</div>

<br />
<div
	class="flex flex-wrap items-center justify-center pb-9 pt-16 text-6xl text-green-300 sm:text-7xl md:text-8xl lg:text-9xl"
>
	<button
		class="tooltip tooltip-bottom hover:bg-transparent"
		data-tip={copyTooltipText}
		on:click={() => {
			navigator.clipboard.writeText(String(calculatedValue))
			copyTooltipText = 'Copied!'
		}}
		on:mouseleave={() => {
			setTimeout(() => {
				copyTooltipText = 'Click to copy'
			}, 300)
		}}
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
