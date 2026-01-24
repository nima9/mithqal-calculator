import currencyData from '$lib/data/currencies.json';

interface Currency {
	code: string;
	name: string;
	symbol_native: string;
}

export function countryToCurrency(countryCode: string): string {
	let printedCurr = '';
	const matchedCurrency = Object.values(currencyData as Record<string, Currency>).find(
		(c) => c.code.slice(0, 2) === countryCode
	);
	if (!matchedCurrency) {
		printedCurr = '$ USD';
	} else {
		printedCurr = `${matchedCurrency.symbol_native} ${matchedCurrency.code}`;
	}

	return printedCurr;
}
