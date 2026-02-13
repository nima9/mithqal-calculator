<!--
	RatesTimestamp.svelte
	Displays the timestamp of when metal/currency rates were last fetched.
	Uses Date + Intl.DateTimeFormat for timezone-aware date formatting.
-->

<script lang="ts">
	// ============================================
	// Props
	// ============================================

	interface Props {
		lastFetchTime: number;
		timezone?: string;
	}

	let { lastFetchTime, timezone = 'America/Los_Angeles' }: Props = $props();

	// ============================================
	// Derived Values
	// ============================================

	/** Format the timestamp in the user's timezone with full date/time */
	let readableRateDate = $derived.by(() => {
		if (!lastFetchTime) return '...';

		// Date/Intl version (active)
		const date = new Date(lastFetchTime);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			timeZone: timezone,
			timeZoneName: 'long'
		}).format(date);

		// Temporal version (for side-by-side reference)
		// const zonedDateTime = Temporal.Instant.fromEpochMilliseconds(lastFetchTime).toZonedDateTimeISO(
		// 	timezone
		// );
		// return zonedDateTime.toLocaleString('en-US', {
		// 	year: 'numeric',
		// 	month: 'long',
		// 	day: 'numeric',
		// 	hour: 'numeric',
		// 	minute: 'numeric',
		// 	timeZoneName: 'long'
		// });
	});
</script>

<div
	class="flex flex-wrap justify-center pt-24 pb-1 text-neutral-content/60 text-xs sm:text-xs md:text-sm lg:text-lg lg:justify-end lg:px-7"
>
	Rates as of: {readableRateDate}
</div>
