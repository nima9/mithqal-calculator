<!--
	RatesTimestamp.svelte
	Displays the timestamp of when metal/currency rates were last fetched.
	Uses Temporal API for timezone-aware date formatting.
-->

<script lang="ts">
	import { Temporal } from '@js-temporal/polyfill';

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

		// Convert epoch milliseconds to Temporal.ZonedDateTime
		const zonedDateTime = Temporal.Instant.fromEpochMilliseconds(lastFetchTime).toZonedDateTimeISO(
			timezone
		);

		// Format with Temporal's toLocaleString
		return zonedDateTime.toLocaleString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			timeZoneName: 'long'
		});
	});
</script>

<div
	class="flex flex-wrap justify-center pt-24 pb-1 text-neutral-content/60 text-xs sm:text-xs md:text-sm lg:text-lg lg:justify-end lg:px-7"
>
	Rates as of: {readableRateDate}
</div>
