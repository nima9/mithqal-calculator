import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Currency metadata - all fiat currencies from fxratesapi.com/latest
const CURRENCIES = [
  // Major currencies
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },

  // European currencies
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин." },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark", symbol: "KM" },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден" },
  { code: "ALL", name: "Albanian Lek", symbol: "L" },
  { code: "MDL", name: "Moldovan Leu", symbol: "L" },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "BYN", name: "Belarusian Ruble", symbol: "Br" },
  { code: "BYR", name: "Belarusian Ruble (old)", symbol: "Br" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼" },
  { code: "LTL", name: "Lithuanian Litas", symbol: "Lt" },
  { code: "LVL", name: "Latvian Lats", symbol: "Ls" },
  { code: "GGP", name: "Guernsey Pound", symbol: "£" },
  { code: "GIP", name: "Gibraltar Pound", symbol: "£" },
  { code: "IMP", name: "Isle of Man Pound", symbol: "£" },
  { code: "JEP", name: "Jersey Pound", symbol: "£" },
  { code: "FKP", name: "Falkland Islands Pound", symbol: "£" },
  { code: "SHP", name: "Saint Helena Pound", symbol: "£" },

  // Middle East currencies
  { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
  { code: "SYP", name: "Syrian Pound", symbol: "£S" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼" },

  // African currencies
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
  { code: "LYD", name: "Libyan Dinar", symbol: "ل.د" },
  { code: "SDG", name: "Sudanese Pound", symbol: "£" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw" },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu" },
  { code: "DJF", name: "Djiboutian Franc", symbol: "Fdj" },
  { code: "KMF", name: "Comorian Franc", symbol: "CF" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC" },
  { code: "GNF", name: "Guinean Franc", symbol: "FG" },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨" },
  { code: "SCR", name: "Seychellois Rupee", symbol: "₨" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK" },
  { code: "ZMK", name: "Zambian Kwacha (old)", symbol: "ZK" },
  { code: "BWP", name: "Botswana Pula", symbol: "P" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$" },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "E" },
  { code: "LSL", name: "Lesotho Loti", symbol: "L" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz" },
  { code: "CVE", name: "Cape Verdean Escudo", symbol: "$" },
  { code: "GMD", name: "Gambian Dalasi", symbol: "D" },
  { code: "SLL", name: "Sierra Leonean Leone", symbol: "Le" },
  { code: "LRD", name: "Liberian Dollar", symbol: "L$" },
  { code: "ERN", name: "Eritrean Nakfa", symbol: "Nfk" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh.So." },
  { code: "MRO", name: "Mauritanian Ouguiya", symbol: "UM" },
  { code: "STD", name: "São Tomé and Príncipe Dobra", symbol: "Db" },

  // Asian currencies
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "₨" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  { code: "LAK", name: "Lao Kip", symbol: "₭" },
  { code: "BND", name: "Brunei Dollar", symbol: "B$" },
  { code: "MOP", name: "Macanese Pataca", symbol: "MOP$" },
  { code: "MNT", name: "Mongolian Tugrik", symbol: "₮" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "soʻm" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ" },
  { code: "KGS", name: "Kyrgyzstani Som", symbol: "с" },
  { code: "TMT", name: "Turkmenistani Manat", symbol: "m" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu." },
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
  { code: "KPW", name: "North Korean Won", symbol: "₩" },

  // Americas currencies
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
  { code: "CLP", name: "Chilean Peso", symbol: "CL$" },
  { code: "COP", name: "Colombian Peso", symbol: "CO$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "VEF", name: "Venezuelan Bolívar", symbol: "Bs" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U" },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs." },
  { code: "CRC", name: "Costa Rican Colón", symbol: "₡" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L" },
  { code: "NIO", name: "Nicaraguan Córdoba", symbol: "C$" },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/." },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$" },
  { code: "CUP", name: "Cuban Peso", symbol: "₱" },
  { code: "CUC", name: "Cuban Convertible Peso", symbol: "CUC$" },
  { code: "HTG", name: "Haitian Gourde", symbol: "G" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$" },
  { code: "TTD", name: "Trinidad and Tobago Dollar", symbol: "TT$" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "Bds$" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "B$" },
  { code: "BMD", name: "Bermudian Dollar", symbol: "BD$" },
  { code: "KYD", name: "Cayman Islands Dollar", symbol: "CI$" },
  { code: "XCD", name: "East Caribbean Dollar", symbol: "EC$" },
  { code: "SVC", name: "Salvadoran Colón", symbol: "₡" },
  { code: "AWG", name: "Aruban Florin", symbol: "Afl." },
  { code: "ANG", name: "Netherlands Antillean Guilder", symbol: "NAƒ" },
  { code: "SRD", name: "Surinamese Dollar", symbol: "Sr$" },
  { code: "GYD", name: "Guyanese Dollar", symbol: "G$" },
  { code: "CLF", name: "Chilean Unit of Account (UF)", symbol: "UF" },

  // Pacific currencies
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$" },
  { code: "PGK", name: "Papua New Guinean Kina", symbol: "K" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "SI$" },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "VT" },
  { code: "WST", name: "Samoan Tala", symbol: "WS$" },
  { code: "TOP", name: "Tongan Paʻanga", symbol: "T$" },
  { code: "XPF", name: "CFP Franc", symbol: "₣" },

  // Turkish
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },

  //Crypto currencies
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
];

// Seed all currencies with initial data
export const seedCurrencies = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let success = true;

    // Fetch current rates from fxratesapi
    let rates: Record<string, number> = {};
    const ratesController = new AbortController();
    const ratesTimeoutId = setTimeout(() => ratesController.abort(), 10000);

    try {
      const apiKey = process.env.fxratesapi_api;
      const url = `https://api.fxratesapi.com/latest${apiKey ? `?api_key=${apiKey}` : ""}`;
      const response = await fetch(url, { signal: ratesController.signal });
      const data = await response.json();
      if (data.success && data.rates) {
        rates = data.rates;
      }
    } catch (error) {
      console.error("Failed to fetch rates during seed:", error);
      success = false;
    } finally {
      clearTimeout(ratesTimeoutId);
    }

    // Insert currencies using internal mutation
    for (const currency of CURRENCIES) {
      const rateToUSD = rates[currency.code] ?? 1;
      await ctx.runMutation(internal.rates.upsertCurrency, {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        rateToUSD,
      });
    }

    // Fetch and seed gold price
    const goldController = new AbortController();
    const goldTimeoutId = setTimeout(() => goldController.abort(), 10000);

    try {
      const goldResponse = await fetch(
        "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD",
        { signal: goldController.signal },
      );
      const goldData = await goldResponse.json();
      const goldPrice = goldData[0]?.spreadProfilePrices?.[0]?.ask ?? 2750;

      await ctx.runMutation(internal.rates.upsertMetal, {
        name: "gold",
        priceUSD: goldPrice,
        lastUpdated: now,
      });
    } catch (error) {
      console.error("Failed to fetch gold price:", error);
      // Insert with default value
      await ctx.runMutation(internal.rates.upsertMetal, {
        name: "gold",
        priceUSD: 2750,
        lastUpdated: now,
      });
      success = false;
    } finally {
      clearTimeout(goldTimeoutId);
    }

    // Fetch and seed silver price
    const silverController = new AbortController();
    const silverTimeoutId = setTimeout(() => silverController.abort(), 10000);

    try {
      const silverResponse = await fetch(
        "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD",
        { signal: silverController.signal },
      );
      const silverData = await silverResponse.json();
      const silverPrice = silverData[0]?.spreadProfilePrices?.[0]?.ask ?? 30;

      await ctx.runMutation(internal.rates.upsertMetal, {
        name: "silver",
        priceUSD: silverPrice,
        lastUpdated: now,
      });
    } catch (error) {
      console.error("Failed to fetch silver price:", error);
      await ctx.runMutation(internal.rates.upsertMetal, {
        name: "silver",
        priceUSD: 30,
        lastUpdated: now,
      });
      success = false;
    } finally {
      clearTimeout(silverTimeoutId);
    }

    // Log the seed
    await ctx.runMutation(internal.rates.logRateFetch, {
      fetchedAt: now,
      metalsSource: "swissquote",
      currencySource: "fxratesapi",
      success,
    });

    return { seeded: true, currencyCount: CURRENCIES.length };
  },
});
