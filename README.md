# Mithqál-Culator

The Mithqál-Culator is a [Mithqál Calculator](https://mithqal.app/) (get it?) web application built with [Svelte](https://svelte.dev/), [Astro](https://astro.build/), and [Tailwind CSS](https://tailwindcss.com/) that allows users to calculate the value of gold and silver in various currencies in Mithqáls.

## What is a Mithqál?

A Mithqál is a unit of weight usually used to measure gold and silver. One Mithqál is 3.642g. This calculation is useful for Bahá'ís who want to calculate the value of gold and silver in Mithqáls for the payment of the Huqúqu'lláh (The Right of God).

## Features

- Can copy the calculated value to the clipboard by clicking on the total price.
- Displays the date and time of when metals and currency values were last updated.
- Metals and currencies values update once a day (by calling `runMetalsAPI.js` in bun run build:prod) and timestamp value is then updated.

## Usage

1. Open the [Mithqal Calculator](https://mithqal.app/) in your browser.
2. Enter the amount of metal in Mithqal(s) in the input field.
3. Click on the button to switch between gold and silver.
4. The calculated value will be displayed in the selected currency.
5. Click on the calculated value to copy it to the clipboard.

## Goal:

The goal of this project was to build something that can be of service, and also practice coding and calling/handling APIs.

## Future Features:

- Add a random Huqúqu'lláh quote under the calculation.
- Light/Dark mode switch.
- Language switch.
- SEO

---

<br><br><br><br><br><br><br>

## Development

To run the project locally (if you want?), use the following commands:

```sh
# Install dependencies
bun install

# Build the project
    bun run build

    # OR:
    # Call the Metals API and build the project (for production)

    bun run build:prod

# Start the development server
bun run dev
```

## API

The application uses an API to get the current values of gold and silver (from [Metals.dev](https://metals.dev/)). The API is called in the [`runMetalsAPI.js`](command:_github.copilot.openRelativePath?%5B%22runMetalsAPI.js%22%5D "runMetalsAPI.js") script.

## The Tools used:

- [Astro](https://astro.build/) (Meta Framework)
- [Svelte](https://svelte.dev/) (JS Framework)
  - [shadcn-svelte](https://www.shadcn-svelte.com)
- [Tailwind CSS](https://tailwindcss.com/)
  - [DaisyUI](https://daisyui.com/)
- [Bun](https://bun.sh)
- [Prettier](https://prettier.io/)
- [Github Actions](https://github.com/features/actions)
- [Netlify](https://www.netlify.com/)

## Contributing

Contributions and feedback are welcome! Feel free to open an issue!
