// Country code to currency code mapping
const COUNTRY_TO_CURRENCY: Record<string, { code: string; symbol: string }> = {
	US: { code: 'USD', symbol: '$' },
	GB: { code: 'GBP', symbol: '£' },
	EU: { code: 'EUR', symbol: '€' },
	DE: { code: 'EUR', symbol: '€' },
	FR: { code: 'EUR', symbol: '€' },
	IT: { code: 'EUR', symbol: '€' },
	ES: { code: 'EUR', symbol: '€' },
	NL: { code: 'EUR', symbol: '€' },
	BE: { code: 'EUR', symbol: '€' },
	AT: { code: 'EUR', symbol: '€' },
	PT: { code: 'EUR', symbol: '€' },
	IE: { code: 'EUR', symbol: '€' },
	FI: { code: 'EUR', symbol: '€' },
	GR: { code: 'EUR', symbol: '€' },
	JP: { code: 'JPY', symbol: '¥' },
	CN: { code: 'CNY', symbol: '¥' },
	IN: { code: 'INR', symbol: '₹' },
	AU: { code: 'AUD', symbol: '$' },
	CA: { code: 'CAD', symbol: '$' },
	CH: { code: 'CHF', symbol: 'CHF' },
	BR: { code: 'BRL', symbol: 'R$' },
	MX: { code: 'MXN', symbol: '$' },
	KR: { code: 'KRW', symbol: '₩' },
	SG: { code: 'SGD', symbol: '$' },
	HK: { code: 'HKD', symbol: '$' },
	NO: { code: 'NOK', symbol: 'kr' },
	SE: { code: 'SEK', symbol: 'kr' },
	DK: { code: 'DKK', symbol: 'kr' },
	NZ: { code: 'NZD', symbol: '$' },
	ZA: { code: 'ZAR', symbol: 'R' },
	RU: { code: 'RUB', symbol: '₽' },
	TR: { code: 'TRY', symbol: '₺' },
	IL: { code: 'ILS', symbol: '₪' },
	AE: { code: 'AED', symbol: 'د.إ' },
	SA: { code: 'SAR', symbol: '﷼' },
	PH: { code: 'PHP', symbol: '₱' },
	TH: { code: 'THB', symbol: '฿' },
	MY: { code: 'MYR', symbol: 'RM' },
	ID: { code: 'IDR', symbol: 'Rp' },
	PL: { code: 'PLN', symbol: 'zł' },
	CZ: { code: 'CZK', symbol: 'Kč' },
	HU: { code: 'HUF', symbol: 'Ft' },
	CL: { code: 'CLP', symbol: '$' },
	CO: { code: 'COP', symbol: '$' },
	PE: { code: 'PEN', symbol: 'S/' },
	EG: { code: 'EGP', symbol: 'E£' },
	PK: { code: 'PKR', symbol: '₨' },
	BD: { code: 'BDT', symbol: '৳' },
	VN: { code: 'VND', symbol: '₫' },
	NG: { code: 'NGN', symbol: '₦' },
	KW: { code: 'KWD', symbol: 'د.ك' },
	QA: { code: 'QAR', symbol: '﷼' },
	OM: { code: 'OMR', symbol: '﷼' },
	BH: { code: 'BHD', symbol: '.د.ب' },
	JO: { code: 'JOD', symbol: 'د.ا' },
	LB: { code: 'LBP', symbol: 'ل.ل' },
	MA: { code: 'MAD', symbol: 'د.م.' },
	TW: { code: 'TWD', symbol: 'NT$' },
	IR: { code: 'IRR', symbol: '﷼' },
	IQ: { code: 'IQD', symbol: 'ع.د' }
};

export function countryToCurrency(countryCode: string): string {
	const currency = COUNTRY_TO_CURRENCY[countryCode.toUpperCase()];

	if (!currency) {
		return '$ USD';
	}

	return `${currency.symbol} ${currency.code}`;
}
