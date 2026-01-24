import type { PageServerLoad } from './$types';
import { countryToCurrency } from '$lib/utils/countryToCurrency';

export const load: PageServerLoad = async ({ getClientAddress }) => {
	let usersCountry = '';
	let defaultCurrency = '$ USD';

	try {
		const ip = getClientAddress();
		const response = await fetch('https://api.country.is/' + ip);
		const data = await response.json();
		usersCountry = data.country || '';
	} catch (error) {
		console.log('Error fetching country:', error);
	}

	if (usersCountry) {
		defaultCurrency = countryToCurrency(usersCountry);
	}

	return {
		defaultCurrency
	};
};
