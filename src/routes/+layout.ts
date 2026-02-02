/**
 * +layout.ts
 * Exports URL for page transitions and navigation state.
 */

export function load({ url }) {
  return {
    url: url.pathname,
  };
}
