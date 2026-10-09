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
environment. They live in `frontend/e2e/`; the current suite focuses on the
shared `ResourceShowLayout` using a seeded controllable unit. It checks the
resource heading, status, and summary, and compares the shared layout while
masking resource-specific tab content and the recorded-at timestamp. It also
checks that utility and navigation actions are available in the more-actions
menu. This is the primary snapshot coverage today; add snapshots for other
components when they exercise a distinct layout or behavior.

Use these tests as focused pre-merge visual regression checks for components
with snapshot coverage. The current focus is `ResourceShowLayout`, where they
help catch unintended changes to the shared show-page structure. They
complement behavior tests and manual exploration, do not cover every resource
page or tab, and are not part of automated CI.

Authentication runs once as a setup project, and the tests use the seeded test
data.

Start and load the test environment from the repository root if it is not
already running:

```bash
just start
just load
```

Choose how to serve the frontend under test:

### Test environment

Rebuild and restart the frontend container to include the current frontend
changes. From the repository root, run:

```bash
docker compose build frontend
docker compose up -d frontend
```

Then, from `frontend/`, run Playwright against the test environment:

```bash
npm run test:e2e
```

### Development environment

Run the frontend source through Vite. Start the dev server from the repository
root and leave it running:

```bash
just frontend
```

Then, from `frontend/`, run Playwright against the dev server:

```bash
PLAYWRIGHT_BASE_URL=https://dev.flex.internal:5443 npm run test:e2e
```

Vite proxies API and authentication requests to the development services, so
this option uses the current source without rebuilding the frontend image.

Configuration lives in `frontend/playwright.config.ts`. Playwright uses
`https://test.flex.internal:6443` by default. Set `PLAYWRIGHT_BASE_URL` to use
another base URL. The tests run serially against a shared database and browser
session. The Chromium project captures screenshots at a 1920x1080 desktop
viewport.

Expected screenshots are committed under `frontend/e2e/__snapshots__/` so
developers, reviewers, and CI compare against the same baseline. Keep this set
focused. When a deliberate UI change should update a baseline, run from
`frontend/` against the same environment used for the test. For the test
environment:

```bash
npm run test:e2e:update
```

For the development environment:

```bash
PLAYWRIGHT_BASE_URL=https://dev.flex.internal:5443 npm run test:e2e:update
```

Review the changed images alongside the UI change before committing them;
updating snapshots should not be used to dismiss an unexplained difference.
