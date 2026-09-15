# Mithqál-Calculator

A [Mithqál Calculator](https://mithqal.app/) web application built with SvelteKit, Turso, Drizzle, and Cloudflare Workers. It calculates the value of gold and silver in various currencies in Mithqáls.

## What is a Mithqál?

A Mithqál is a unit of weight used to measure gold and silver. One Mithqál is 3.642g. This calculation is useful for Bahá'ís who want to calculate the value of gold and silver in Mithqáls for the payment of the Huqúqu'lláh (The Right of God).

## Features

- **143 currencies** - Supports all major fiat currencies worldwide
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
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [DaisyUI](https://daisyui.com/) - Component library
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
- [Prettier](https://prettier.io/) - Formatter
- [TypeScript](https://www.typescriptlang.org/)

## Development

```sh
# Install dependencies
bun install

# Copy .env.example to .env and add your Turso credentials

# Configure the same secrets in Cloudflare before the first deploy
bunx wrangler secret put TURSO_DATABASE_URL
bunx wrangler secret put TURSO_AUTH_TOKEN

# PUBLIC_TURNSTILE_SITE_KEY is committed as a public Worker variable in wrangler.jsonc.
# Configure TURNSTILE_SECRET_KEY as a Worker secret in the Cloudflare dashboard.
# Local development automatically uses Cloudflare's always-pass test keys.

# Create/update the Turso schema, then seed the initial rates
bun run db:migrate
bun run db:seed

# Start SvelteKit dev server
bun run dev

# Build for production
bun run build

# Preview the Worker locally
bun run preview

# In another terminal, invoke the 06:00 UTC cron handler locally
curl "http://localhost:4173/cdn-cgi/local/scheduled"

# Deploy the Worker and its Cron Trigger
bun run deploy
```

## Contributing

Contributions and feedback are welcome! Feel free to open an issue.
