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
			timeZoneName: 'short'
		};

		return new Intl.DateTimeFormat('en-US', options).format(new Date(lastFetchTime));
	});
</script>

<div class="flex flex-wrap justify-end px-7 pt-24 pb-1 text-neutral-content/60">
	Rates as of: {readableRateDate}
</div>
