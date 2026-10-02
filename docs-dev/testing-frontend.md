# Frontend testing

The frontend has two kinds of tests: unit tests for hooks and end-to-end tests
that compare rendered pages with screenshot snapshots.

## Hook tests

Hook tests use Vitest with a `jsdom` environment and Testing Library. Keep a
test beside its hook, named `<hookFile>.test.ts` or `<hookFile>.test.tsx` when
the test uses JSX.

From `frontend/`, run the complete suite:

```bash
npm test
```

Run one test file or start watch mode while developing:

```bash
npx vitest run src/path/to/useExample.test.ts
npm run test:watch
```

Run `npx tsc --noEmit` after changing a hook or its tests to check TypeScript.

## Playwright screenshot tests

Playwright tests exercise the running frontend against the local test
environment. They live in `frontend/e2e/`; the current tests cover the
controllable-unit show page, its tabs, and the more-actions menu.
Authentication runs once as a setup project, and the tests use the seeded test
data.

Start and load the test environment from the repository root if it is not
already running:

```bash
just start
just load
```

If the frontend code changed, rebuild and restart its container before running
the browser tests:

```bash
docker compose build frontend
docker compose up -d frontend
```

Then, from `frontend/`, run the tests:

```bash
npm run test:e2e
```

Playwright uses `https://test.flex.internal:6443` by default. Set
`PLAYWRIGHT_BASE_URL` to use another base URL. The tests run serially against a
shared database and browser session.

Screenshots are stored under `frontend/e2e/__snapshots__/`. When a deliberate
UI change should update a baseline, run:

```bash
npm run test:e2e:update
```

Review the changed images alongside the UI change before committing them;
updating snapshots should not be used to dismiss an unexplained difference.
