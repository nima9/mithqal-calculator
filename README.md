# Mithqál-Calculator

A [Mithqál Calculator](https://mithqal.app/) web application built with SvelteKit, Turso, Drizzle, and Cloudflare Workers. It calculates the value of gold and silver in various currencies in Mithqáls.

## What is a Mithqál?

A Mithqál is a unit of weight used to measure gold and silver. One Mithqál is 3.642g. This calculation is useful for Bahá'ís who want to calculate the value of gold and silver in Mithqáls for the payment of the Huqúqu'lláh (The Right of God).

## Features

- **Fiat and crypto rates** - Active fiat currencies plus a separately labeled crypto section
- **Twice-daily rates** - Metal prices and exchange rates refreshed by a Cloudflare Cron Trigger
- **Current catalog** - Active fiat currencies and cryptocurrencies synced monthly from FXRatesAPI
- **Geo-detection** - Auto-selects currency based on user's location (via Cloudflare)
- **Timezone-aware** - Displays rate timestamps in user's local timezone
- **Copy to clipboard** - Click the calculated value to copy
- **Mobile-friendly** - Responsive design with proper RTL currency support

## Supported Languages

The interface is currently available in English, Afrikaans, Arabic, Bemba, Burmese, Chinese,
French, German, Hindi, Japanese, Korean, Lingala, Malay, Persian, Portuguese, Russian, Spanish,
Swahili, Tagalog, Thai, Tok Pisin, Urdu, Vietnamese, and Zulu.

## Supported Currencies

The calculator supports 163 currencies: the active fiat catalog synced from FXRatesAPI plus Bitcoin.
Symbols are the native display symbols.

### Major currencies

| Code | Currency           | Symbol |
| ---- | ------------------ | ------ |
| USD  | US Dollar          | `$`    |
| EUR  | Euro               | `€`    |
| GBP  | British Pound      | `£`    |
| JPY  | Japanese Yen       | `¥`    |
| CHF  | Swiss Franc        | `Fr`   |
| CAD  | Canadian Dollar    | `C$`   |
| AUD  | Australian Dollar  | `A$`   |
| NZD  | New Zealand Dollar | `NZ$`  |
| CNY  | Chinese Yuan       | `¥`    |
| HKD  | Hong Kong Dollar   | `HK$`  |
| SGD  | Singapore Dollar   | `S$`   |
| INR  | Indian Rupee       | `₹`    |

### European currencies

| Code | Currency                            | Symbol |
| ---- | ----------------------------------- | ------ |
| SEK  | Swedish Krona                       | `kr`   |
| NOK  | Norwegian Krone                     | `kr`   |
| DKK  | Danish Krone                        | `kr`   |
| PLN  | Polish Zloty                        | `zł`   |
| CZK  | Czech Koruna                        | `Kč`   |
| HUF  | Hungarian Forint                    | `Ft`   |
| RON  | Romanian Leu                        | `lei`  |
| BGN  | Bulgarian Lev                       | `лв`   |
| HRK  | Croatian Kuna                       | `kn`   |
| RSD  | Serbian Dinar                       | `дин.` |
| BAM  | Bosnia-Herzegovina Convertible Mark | `KM`   |
| MKD  | Macedonian Denar                    | `ден`  |
| ALL  | Albanian Lek                        | `L`    |
| MDL  | Moldovan Leu                        | `L`    |
| ISK  | Icelandic Krona                     | `kr`   |
| RUB  | Russian Ruble                       | `₽`    |
| UAH  | Ukrainian Hryvnia                   | `₴`    |
| BYN  | Belarusian Ruble                    | `Br`   |
| BYR  | Belarusian Ruble (old)              | `Br`   |
| GEL  | Georgian Lari                       | `₾`    |
| AMD  | Armenian Dram                       | `֏`    |
| AZN  | Azerbaijani Manat                   | `₼`    |
| LTL  | Lithuanian Litas                    | `Lt`   |
| LVL  | Latvian Lats                        | `Ls`   |
| GGP  | Guernsey Pound                      | `£`    |
| GIP  | Gibraltar Pound                     | `£`    |
| IMP  | Isle of Man Pound                   | `£`    |
| JEP  | Jersey Pound                        | `£`    |
| FKP  | Falkland Islands Pound              | `£`    |
| SHP  | Saint Helena Pound                  | `£`    |

### Middle East currencies

| Code | Currency                    | Symbol |
| ---- | --------------------------- | ------ |
| AED  | United Arab Emirates Dirham | `د.إ`  |
| SAR  | Saudi Riyal                 | `﷼`    |
| QAR  | Qatari Riyal                | `﷼`    |
| KWD  | Kuwaiti Dinar               | `د.ك`  |
| BHD  | Bahraini Dinar              | `.د.ب` |
| OMR  | Omani Rial                  | `﷼`    |
| JOD  | Jordanian Dinar             | `د.ا`  |
| LBP  | Lebanese Pound              | `ل.ل`  |
| ILS  | Israeli New Shekel          | `₪`    |
| IRR  | Iranian Rial                | `﷼`    |
| IQD  | Iraqi Dinar                 | `ع.د`  |
| SYP  | Syrian Pound                | `£S`   |
| YER  | Yemeni Rial                 | `﷼`    |

### African currencies

| Code | Currency                    | Symbol   |
| ---- | --------------------------- | -------- |
| ZAR  | South African Rand          | `R`      |
| EGP  | Egyptian Pound              | `E£`     |
| NGN  | Nigerian Naira              | `₦`      |
| MAD  | Moroccan Dirham             | `د.م.`   |
| DZD  | Algerian Dinar              | `د.ج`    |
| TND  | Tunisian Dinar              | `د.ت`    |
| LYD  | Libyan Dinar                | `ل.د`    |
| SDG  | Sudanese Pound              | `£`      |
| KES  | Kenyan Shilling             | `KSh`    |
| UGX  | Ugandan Shilling            | `USh`    |
| TZS  | Tanzanian Shilling          | `TSh`    |
| GHS  | Ghanaian Cedi               | `₵`      |
| XOF  | West African CFA Franc      | `CFA`    |
| XAF  | Central African CFA Franc   | `FCFA`   |
| ETB  | Ethiopian Birr              | `Br`     |
| RWF  | Rwandan Franc               | `FRw`    |
| BIF  | Burundian Franc             | `FBu`    |
| DJF  | Djiboutian Franc            | `Fdj`    |
| KMF  | Comorian Franc              | `CF`     |
| CDF  | Congolese Franc             | `FC`     |
| GNF  | Guinean Franc               | `FG`     |
| MGA  | Malagasy Ariary             | `Ar`     |
| MUR  | Mauritian Rupee             | `₨`      |
| SCR  | Seychellois Rupee           | `₨`      |
| MWK  | Malawian Kwacha             | `MK`     |
| ZMW  | Zambian Kwacha              | `ZK`     |
| ZMK  | Zambian Kwacha (old)        | `ZK`     |
| BWP  | Botswana Pula               | `P`      |
| NAD  | Namibian Dollar             | `N$`     |
| SZL  | Swazi Lilangeni             | `E`      |
| LSL  | Lesotho Loti                | `L`      |
| MZN  | Mozambican Metical          | `MT`     |
| AOA  | Angolan Kwanza              | `Kz`     |
| CVE  | Cape Verdean Escudo         | `$`      |
| GMD  | Gambian Dalasi              | `D`      |
| SLL  | Sierra Leonean Leone        | `Le`     |
| LRD  | Liberian Dollar             | `L$`     |
| ERN  | Eritrean Nakfa              | `Nfk`    |
| SOS  | Somali Shilling             | `Sh.So.` |
| MRO  | Mauritanian Ouguiya         | `UM`     |
| STD  | São Tomé and Príncipe Dobra | `Db`     |

### Asian currencies

| Code | Currency            | Symbol |
| ---- | ------------------- | ------ |
| KRW  | South Korean Won    | `₩`    |
| TWD  | Taiwan Dollar       | `NT$`  |
| THB  | Thai Baht           | `฿`    |
| MYR  | Malaysian Ringgit   | `RM`   |
| IDR  | Indonesian Rupiah   | `Rp`   |
| PHP  | Philippine Peso     | `₱`    |
| VND  | Vietnamese Dong     | `₫`    |
| PKR  | Pakistani Rupee     | `₨`    |
| BDT  | Bangladeshi Taka    | `৳`    |
| LKR  | Sri Lankan Rupee    | `Rs`   |
| NPR  | Nepalese Rupee      | `₨`    |
| MMK  | Myanmar Kyat        | `K`    |
| KHR  | Cambodian Riel      | `៛`    |
| LAK  | Lao Kip             | `₭`    |
| BND  | Brunei Dollar       | `B$`   |
| MOP  | Macanese Pataca     | `MOP$` |
| MNT  | Mongolian Tugrik    | `₮`    |
| KZT  | Kazakhstani Tenge   | `₸`    |
| UZS  | Uzbekistani Som     | `soʻm` |
| TJS  | Tajikistani Somoni  | `ЅМ`   |
| KGS  | Kyrgyzstani Som     | `с`    |
| TMT  | Turkmenistani Manat | `m`    |
| AFN  | Afghan Afghani      | `؋`    |
| BTN  | Bhutanese Ngultrum  | `Nu.`  |
| MVR  | Maldivian Rufiyaa   | `Rf`   |
| KPW  | North Korean Won    | `₩`    |

### Americas currencies

| Code | Currency                      | Symbol |
| ---- | ----------------------------- | ------ |
| MXN  | Mexican Peso                  | `MX$`  |
| BRL  | Brazilian Real                | `R$`   |
| ARS  | Argentine Peso                | `AR$`  |
| CLP  | Chilean Peso                  | `CL$`  |
| COP  | Colombian Peso                | `CO$`  |
| PEN  | Peruvian Sol                  | `S/`   |
| VEF  | Venezuelan Bolívar            | `Bs`   |
| UYU  | Uruguayan Peso                | `$U`   |
| PYG  | Paraguayan Guarani            | `₲`    |
| BOB  | Bolivian Boliviano            | `Bs.`  |
| CRC  | Costa Rican Colón             | `₡`    |
| GTQ  | Guatemalan Quetzal            | `Q`    |
| HNL  | Honduran Lempira              | `L`    |
| NIO  | Nicaraguan Córdoba            | `C$`   |
| PAB  | Panamanian Balboa             | `B/.`  |
| DOP  | Dominican Peso                | `RD$`  |
| CUP  | Cuban Peso                    | `₱`    |
| CUC  | Cuban Convertible Peso        | `CUC$` |
| HTG  | Haitian Gourde                | `G`    |
| JMD  | Jamaican Dollar               | `J$`   |
| TTD  | Trinidad and Tobago Dollar    | `TT$`  |
| BBD  | Barbadian Dollar              | `Bds$` |
| BSD  | Bahamian Dollar               | `B$`   |
| BMD  | Bermudian Dollar              | `BD$`  |
| KYD  | Cayman Islands Dollar         | `CI$`  |
| XCD  | East Caribbean Dollar         | `EC$`  |
| SVC  | Salvadoran Colón              | `₡`    |
| AWG  | Aruban Florin                 | `Afl.` |
| ANG  | Netherlands Antillean Guilder | `NAƒ`  |
| SRD  | Surinamese Dollar             | `Sr$`  |
| GYD  | Guyanese Dollar               | `G$`   |
| CLF  | Chilean Unit of Account (UF)  | `UF`   |

### Pacific currencies

| Code | Currency               | Symbol |
| ---- | ---------------------- | ------ |
| FJD  | Fijian Dollar          | `FJ$`  |
| PGK  | Papua New Guinean Kina | `K`    |
| SBD  | Solomon Islands Dollar | `SI$`  |
| VUV  | Vanuatu Vatu           | `VT`   |
| WST  | Samoan Tala            | `WS$`  |
| TOP  | Tongan Paʻanga         | `T$`   |
| XPF  | CFP Franc              | `₣`    |

### Turkish

| Code | Currency     | Symbol |
| ---- | ------------ | ------ |
| TRY  | Turkish Lira | `₺`    |

### Crypto

| Code | Currency | Symbol |
| ---- | -------- | ------ |
| BTC  | Bitcoin  | `₿`    |

## Usage

1. Open the [Mithqal Calculator](https://mithqal.app/) in your browser
2. Enter the amount of metal in Mithqal(s)
3. Click the metal button to switch between Gold and Silver
4. Select your currency from the dropdown
5. Click the calculated value to copy it to clipboard

## Tech Stack

### Frontend

- [SvelteKit](https://svelte.dev/) - Full-stack framework
- [Svelte 5](https://svelte.dev/) - UI framework with runes
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling (custom component classes, no UI library)
- [bits-ui](https://bits-ui.com/) - Headless components

### Backend

- [Turso](https://turso.tech/) - Hosted SQLite-compatible database
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database access and migrations
- [Cloudflare Workers](https://workers.cloudflare.com/) - Hosting, edge functions, and cron scheduling
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) - Bot protection

### Data Sources

- [FX Rates API](https://fxratesapi.com/) - Currency exchange rates
- [Swissquote](https://www.swissquote.com/) - Gold & silver prices

### Tooling

- [Bun](https://bun.sh/) - Package manager & runtime
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - Cloudflare CLI
- [OxLint](https://oxc.rs/) - Linter
- [Oxfmt](https://oxc.rs/) - Formatter
- [TypeScript](https://www.typescriptlang.org/)

## Development

```sh
# Install dependencies
bun install

# Environment variables and secrets are managed by Varlock. `.env.schema` is the
# single source of truth; sensitive values resolve from the `pass` store under
# `mithqal-calculator/production/*`. Local-only overrides live in tracked
# `.env.development` / `.env.production` files (no secrets).
#
# Create the pass entries once (see `.env.schema` for the exact paths):
#   pass insert -m mithqal-calculator/production/TURSO_DATABASE_URL
#   pass insert -m mithqal-calculator/production/TURSO_AUTH_TOKEN
#   pass insert -m mithqal-calculator/production/CONTACT_EMAIL
#   pass insert -m mithqal-calculator/production/PUBLIC_TURNSTILE_SITE_KEY
#   pass insert -m mithqal-calculator/production/TURNSTILE_SECRET_KEY
#   pass insert -m mithqal-calculator/production/FXRATESAPI_SERVER_KEY
#
# Validate the resolved environment (sensitive values are redacted)
bun run env:check
VARLOCK_ENV=production bun run env:check-prod

# Create/update the Turso schema, then seed the initial rates
bun run db:migrate
bun run db:seed

# Start SvelteKit dev server
bun run dev

# Build for production
bun run build

# Run the same type, lint, format, test, and build gate used by CI and deploys
bun run validate

# Preview the Worker locally
bun run preview

# In another terminal, invoke the 06:00 UTC cron handler locally
curl "http://localhost:4173/cdn-cgi/local/scheduled"

# Deploy the Worker and its Cron Trigger. `varlock-wrangler deploy` resolves the
# environment and uploads non-sensitive values as Worker vars and sensitive
# values as Worker secrets.
bun run deploy
```

The scheduled Worker fetches both metal prices and authenticated USD-based currency rates twice
daily (06:00 and 18:00 UTC). On the first day of each month at 06:15 UTC, it also replaces the
active fiat/crypto catalog from FXRatesAPI's `/currencies` endpoint. It stores only complete,
validated updates, so failed refreshes leave prior data untouched. Gold and silver use the median
bid/ask midpoint from the timestamped Swissquote quote closest to the FXRatesAPI snapshot time.

## Contributing

Contributions and feedback are welcome! Feel free to open an issue.
