<!--
	RatesTimestamp.svelte
	Displays the timestamp of when rates were last fetched.
-->

<script lang="ts">
	interface Props {
		lastFetchTime: number;
		timezone?: string;
	}

	let { lastFetchTime, timezone = 'America/Los_Angeles' }: Props = $props();

	let readableRateDate = $derived.by(() => {
		if (!lastFetchTime) return '...';

		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			timeZone: timezone,
			timeZoneName: 'long'
		};

		return new Intl.DateTimeFormat('en-US', options).format(new Date(lastFetchTime));
	});
</script>

<div
	class="flex flex-wrap justify-center pt-24 pb-1 text-neutral-content/60 text-xs sm:text-xs md:text-sm lg:text-lg lg:justify-end lg:px-7"
>
	Rates as of: {readableRateDate}
</div>
