# Mithqál-Calculator

A [Mithqál Calculator](https://mithqal.app/) web application built with SvelteKit and Convex that allows users to calculate the value of gold and silver in various currencies in Mithqáls.

## What is a Mithqál?

A Mithqál is a unit of weight used to measure gold and silver. One Mithqál is 3.642g. This calculation is useful for Bahá'ís who want to calculate the value of gold and silver in Mithqáls for the payment of the Huqúqu'lláh (The Right of God).

## Features

- **143 currencies** - Supports all major fiat currencies worldwide
- **Real-time rates** - Metal prices and exchange rates updated via Convex backend
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

- [Convex](https://convex.dev/) - Backend platform (database, functions, scheduling)
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting & edge functions
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

# Start SvelteKit dev server
bun run dev

# Start Convex dev server (in another terminal)
bun run convex:dev

# Seed the database with currencies
bunx convex run seed:seedCurrencies

# Build for production
bun run build

# Preview production build locally
bun run preview
```

## Contributing

Contributions and feedback are welcome! Feel free to open an issue.
