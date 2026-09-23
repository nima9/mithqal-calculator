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
