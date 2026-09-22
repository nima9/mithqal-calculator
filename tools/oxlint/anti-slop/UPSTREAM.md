# Vendored anti-slop Oxlint plugins

This project vendors the anti-slop Oxlint plugins. The repository owns these files
and their configuration; treat updates as a reviewed merge (see the
`install-anti-slop` skill), not a directory replacement.

## Provenance

- **Source:** unknown — installed from the bundled `install-anti-slop` skill assets
  (`.agents/skills/install-anti-slop/assets/anti-slop/`). The bundle carries no
  source repository URL or exact source commit, so the revision cannot be
  identified beyond "the snapshot shipped with the installed skill bundle".
- **Installed generic plugin:** `tools/oxlint/anti-slop/index.ts` (`anti-slop`)
- **Installed Effect plugin:** `tools/oxlint/anti-slop/effect/index.ts`
  (`anti-slop-effect`)
- **Configuration:** `.oxlintrc.json` — `jsPlugins`, `ignorePatterns`, and rule
  severities. Agent tooling directories and this vendored tree are ignored by
  lint and format.
- **Dependency:** `@oxlint/plugins` pinned exactly to `1.83.0`, matching the
  installed `oxlint@1.83.0`.

## Vendored third-party code

- `vendor/eslint-stylistic/` — adapted `padding-line-between-statements` from
  [ESLint Stylistic](https://github.com/eslint-stylistic/eslint-stylistic) at
  commit `435c3ea0fd26a5fef9042c4b36b6e165fbbf8d08` (MIT). See the nested
  `vendor/eslint-stylistic/UPSTREAM.md` and `LICENSE`, which must travel with
  every copy. Consumed by `rules/require-readable-spacing.ts`.

## Intentional deviations from the bundle

- None recorded. The vendored tree is a byte-for-byte copy of the skill bundle
  except where the repository's formatter/lint configuration applies (this tree
  is excluded from `oxfmt` and `oxlint`).
- The Effect plugin is enabled because `effect` is a direct dependency in
  `package.json`.

## Update notes

- No recoverable pristine upstream base is available for the next update; a
  future update must treat comparisons as a two-way merge between the local tree
  and the incoming bundle, and cannot assume a common ancestor.
- Keep `@oxlint/plugins` and `oxlint` on the same pinned version.
