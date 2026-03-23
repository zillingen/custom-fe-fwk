# Frontend framework project

This document is for coding agents working in `/Users/zillingen/dev/custom-fe-fwk`.
It captures practical commands and repository conventions inferred from the code.

## Repository shape

- Monorepo managed with npm workspaces.
- Workspaces:
  - `packages/compiler` (`custom-fe-fwk-compiler`)
  - `packages/loader` (`custom-fe-fwk-loader`)
  - `packages/runtime` (`custom-fe-fwk`)
- Root has very few scripts; most work happens in each package.
- Tests use Vitest in all packages.
- Build uses Rollup in all packages.
- Lint uses ESLint in all packages.

## Setup

- Install deps from repo root:
  - `npm install`
- Optional example server (root):
  - `npm run serve:examples`

## Build commands

From repo root (workspace form):

- Build compiler:
  - `npm --workspace packages/compiler run build`
- Build loader:
  - `npm --workspace packages/loader run build`
- Build runtime:
  - `npm --workspace packages/runtime run build`

From package directories (direct form):

- `npm run build`

## Lint commands

From repo root (workspace form):

- Lint compiler:
  - `npm --workspace packages/compiler run lint`
- Lint loader:
  - `npm --workspace packages/loader run lint`
- Lint runtime:
  - `npm --workspace packages/runtime run lint`

Auto-fix:

- `npm --workspace packages/compiler run lint:fix`
- `npm --workspace packages/loader run lint:fix`
- `npm --workspace packages/runtime run lint:fix`

## Test commands

### Run all tests (watch mode)

- Compiler:
  - `npm --workspace packages/compiler run test`
- Loader:
  - `npm --workspace packages/loader run test`
- Runtime:
  - `npm --workspace packages/runtime run test`

### Run all tests once (CI/local verification)

- Compiler:
  - `npm --workspace packages/compiler run test:run`
- Loader:
  - `npm --workspace packages/loader run test:run`
- Runtime:
  - `npm --workspace packages/runtime run test:run`

### Run a single test file (important)

Pass args after `--` so npm forwards them to Vitest.

- Compiler single file:
  - `npm --workspace packages/compiler run test:run -- src/__tests__/sample.test.js`
- Loader single file:
  - `npm --workspace packages/loader run test:run -- src/__tests__/sample.test.js`
- Runtime single file:
  - `npm --workspace packages/runtime run test:run -- src/__tests__/attributes.test.ts`

### Run a single test by name/pattern

- Compiler:
  - `npm --workspace packages/compiler run test:run -- -t "sample test"`
- Loader:
  - `npm --workspace packages/loader run test:run -- -t "sample test"`
- Runtime:
  - `npm --workspace packages/runtime run test:run -- -t "returns message VNode"`

### Coverage

- Runtime only has dedicated coverage script:
  - `npm --workspace packages/runtime run test:coverage`

## Package-specific notes

- `packages/runtime`:
  - TypeScript + ESM (`"type": "module"`).
  - Uses `eslint.config.js` (flat config).
  - Type-aware linting enabled (`parserOptions.project`).
  - Strict TypeScript compiler options are enabled.
- `packages/compiler` and `packages/loader`:
  - JavaScript source currently.
  - Use classic `.eslintrc.js` with `eslint:recommended`.

## Code style guidelines

Follow existing local style first. If style differs between files, keep file-consistent edits.

### Imports

- Use ESM imports/exports everywhere.
- Prefer relative imports within a package (`./x`, `../x`).
- Keep import groups simple:
  1) value imports,
  2) type-only imports (`import type { ... } ...`) for TS.
- Prefer explicit named imports over namespace imports.
- Avoid unused imports; lint/TS settings are strict.

### Formatting

- Prefer single quotes in JS/TS.
- Preserve surrounding semicolon style in touched files.
  - Runtime has mixed semicolon usage; do not mass-reformat unrelated lines.
- Keep lines readable; avoid deeply nested expressions when a helper improves clarity.
- Do not introduce broad formatting-only diffs.

### Types (runtime package)

- Prefer explicit return types on exported functions.
- Use narrow union types and `as const` where helpful (existing pattern in `DOM_TYPES`).
- Use `import type` for type-only symbols.
- Avoid `any`; use `unknown` and refine when needed.
- Keep domain types in `*.types.ts` when shared broadly.

### Naming conventions

- Variables/functions: `camelCase`.
- Types/interfaces/type aliases: `PascalCase`.
- Components/factories returning VNodes: `PascalCase` for component-like APIs.
- Constants: `UPPER_SNAKE_CASE` only for true constants (for example `DOM_TYPES`).
- Files in runtime source currently use kebab-case (for example `mount-dom.ts`); follow that.
- Test files: `*.test.ts` / `*.test.js`, usually under `__tests__`.

### Error handling

- Throw `Error` for impossible/invalid states (existing pattern in DOM mount/destroy code).
- Include actionable error messages (what failed + key input/context).
- Do not swallow errors silently.
- Prefer guard clauses for missing required DOM elements or invalid inputs.

### Testing guidelines

- Use Vitest APIs (`describe`, `it`/`test`, `expect`).
- Co-locate tests under `src/**/__tests__` when possible.
- Prefer behavior-oriented test names.
- Keep tests deterministic; avoid network/timer flakiness unless explicitly controlled.
- When changing runtime behavior, add or update tests in the same package.

### Linting and quality gates

- Run lint + relevant tests for changed package(s) before finishing.
- Minimum expectation for targeted edits:
  - `npm --workspace <pkg> run lint`
  - `npm --workspace <pkg> run test:run -- <changed-test-or-pattern>`
- For larger edits, run full package tests once.

## Agent workflow recommendations

- Make small, focused diffs.
- Avoid editing generated artifacts under `dist/` directly.
- Keep changes package-scoped unless cross-package coordination is required.
- If modifying public runtime types/APIs, verify call sites and tests.
- Prefer incremental commits with clear scope when asked to commit.

## Cursor/Copilot rule check

No repository-specific Cursor or Copilot instruction files were found at the time of writing:

- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

If these files are added later, update this AGENTS.md to mirror any mandatory guidance.
