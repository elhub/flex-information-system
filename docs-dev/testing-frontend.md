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

> [!NOTE]
> Screenshot testing is new and a work in progress.

### Why

Many pages share a few layout components, so one change can affect many pages.
A code diff does not show how those pages look afterwards. Screenshot tests
render a real page and compare it with an approved image in the repository.
This catches unintended visual changes before merge, and makes intended changes
visible to reviewers as an updated image in the pull request.

### Scope

The tests cover the structure of **shared components**, not individual
resources. One representative page per shared component is enough.

Out of scope: resource-specific content (masked in the screenshot), business
rules and authorisation (covered by API and database tests), and full user
journeys. Keep the set of images small so every change gets reviewed.

### How we use them

Run the tests locally before merging changes to shared components, styling, or
frontend dependencies. They are not yet part of CI.

- If a failure is expected, update the baseline and check the new image.
- If a failure is unexpected, treat it as a bug and find the cause first.
- In review, check that changed images show the intended change and nothing
  else.

### Current coverage

The suite in `frontend/e2e/` covers `ResourceShowLayout` on the show page of
the seeded controllable unit `Test Solar`. It checks the heading, the `Active`
status, and the `More` button, then compares the layout with the baseline. The
summary (`resource-show-summary`) and tab content (`resource-show-content`) are
masked, so the image only covers the shared frame.

Authentication runs once in `e2e/auth.setup.ts`, which assumes the `Test FISO`
party. Settings in `frontend/playwright.config.ts` keep screenshots stable:
serial runs, Chromium at 1920x1080, fixed locale and time zone, and disabled
animations.

### Running the tests

Start and load the test environment if it is not already running:

```bash
just start
just load
```

Choose how to serve the frontend under test. Playwright uses
`https://test.flex.internal:6443` by default; set `PLAYWRIGHT_BASE_URL` to use
another base URL.

#### Test environment

Rebuild the images to include the current frontend changes:

```bash
just reset
```

Then, from `frontend/`, run Playwright against the test environment:

```bash
npm run test:e2e
```

#### Development environment

Both the backend and the frontend must be running locally. Start each in its
own terminal and leave them running:

```bash
just backend
```

```bash
just frontend
```

Then, from `frontend/`, run Playwright against the dev server:

```bash
PLAYWRIGHT_BASE_URL=https://dev.flex.internal:5443 npm run test:e2e
```

Vite proxies API and authentication requests to the development services, so
this option uses the current source without rebuilding the frontend image.

### Updating baseline images

Baselines are committed under `frontend/e2e/__snapshots__/`. To update them
after a deliberate UI change, run from `frontend/` against the same environment
used for the test. For the test environment:

```bash
npm run test:e2e:update
```

For the development environment, with the backend and frontend running locally:

```bash
PLAYWRIGHT_BASE_URL=https://dev.flex.internal:5443 npm run test:e2e:update
```

Do not update a baseline to dismiss a difference you cannot explain.
