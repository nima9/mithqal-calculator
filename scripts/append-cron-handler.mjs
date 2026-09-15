import { appendFile, readFile } from "node:fs/promises";

const workerPath = ".svelte-kit/cloudflare/worker.js";
const worker = await readFile(workerPath, "utf8");

if (!worker.includes("worker_default")) {
  throw new Error(`Could not find SvelteKit's worker export in ${workerPath}`);
}

await appendFile(
  workerPath,
  `

worker_default.scheduled = async (_controller, env, context) => {
	const response = await worker_default.fetch(
		new Request('https://mithqal.internal/api/internal/refresh-rates', {
			method: 'POST',
			headers: { authorization: 'Bearer ' + env.TURSO_AUTH_TOKEN }
		}),
		env,
		context
	);

	if (!response.ok) {
		throw new Error('Rate refresh failed with HTTP ' + response.status + ': ' + await response.text());
	}
};
`,
);
