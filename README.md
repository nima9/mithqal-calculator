# Mithqál-Calculator

A [Mithqál Calculator](https://mithqal.app/) web application built with SvelteKit, Turso, Drizzle, and Cloudflare Workers. It calculates the value of gold and silver in various currencies in Mithqáls.

## What is a Mithqál?

A Mithqál is a unit of weight used to measure gold and silver. One Mithqál is 3.642g. This calculation is useful for Bahá'ís who want to calculate the value of gold and silver in Mithqáls for the payment of the Huqúqu'lláh (The Right of God).

## Features

- **Fiat and crypto rates** - Active fiat currencies plus a separately labeled crypto section
- **Daily rates** - Metal prices and exchange rates refreshed by a Cloudflare Cron Trigger
- **Geo-detection** - Auto-selects currency based on user's location (via Cloudflare)
- **Timezone-aware** - Displays rate timestamps in user's local timezone
- **Copy to clipboard** - Click the calculated value to copy
- **Mobile-friendly** - Responsive design with proper RTL currency support

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

# Copy .env.example to .env and add credentials for a development-only Turso database.
# Do not reuse the production database locally.

# Configure production secrets in Cloudflare before the first deploy
bunx wrangler secret put CONTACT_EMAIL
bunx wrangler secret put TURNSTILE_SECRET_KEY
bunx wrangler secret put TURSO_DATABASE_URL
bunx wrangler secret put TURSO_AUTH_TOKEN

# PUBLIC_TURNSTILE_SITE_KEY is committed as a public Worker variable in wrangler.jsonc.
# TURNSTILE_HOSTNAMES is also committed there and restricts accepted production hostnames.
# Local development uses Cloudflare's always-pass test keys when no Turnstile keys are set.

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

# Deploy the Worker and its Cron Trigger
bun run deploy
```

The scheduled Worker fetches both metal prices and USD-based currency rates once daily. It stores
only a complete validated snapshot: both metals plus USD and EUR are required, while individual
missing currencies are omitted. Failed refreshes leave the prior snapshot untouched. Gold and
silver use the median of every valid Swissquote bid/ask midpoint.

## Contributing

Contributions and feedback are welcome! Feel free to open an issue.
