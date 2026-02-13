type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
	return typeof value === 'object' && value !== null ? (value as JsonRecord) : null;
}

export function parseFxRatesPayload(value: unknown): Record<string, number> | null {
	const payload = asRecord(value);
	if (!payload || payload.success !== true) return null;

	const rates = asRecord(payload.rates);
	if (!rates) return null;

	const parsedRates: Record<string, number> = {};
	for (const [code, rate] of Object.entries(rates)) {
		if (typeof rate === 'number' && Number.isFinite(rate)) {
			parsedRates[code] = rate;
		}
	}

	return Object.keys(parsedRates).length > 0 ? parsedRates : null;
}

export function parseSwissquoteAsk(value: unknown): number | null {
	if (!Array.isArray(value) || value.length === 0) return null;

	const first = asRecord(value[0]);
	if (!first || !Array.isArray(first.spreadProfilePrices) || first.spreadProfilePrices.length === 0) {
		return null;
	}

	const firstPrice = asRecord(first.spreadProfilePrices[0]);
	const ask = firstPrice?.ask;
	return typeof ask === 'number' && Number.isFinite(ask) ? ask : null;
}

