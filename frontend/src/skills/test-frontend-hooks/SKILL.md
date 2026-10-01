---
name: test-frontend-hooks
description: Write or review Vitest unit tests for custom React hooks in frontend/src (files named useXxx.ts / useXxx.tsx, tested via useXxx.test.ts(x)). Use when adding a new hook, adding tests for an existing untested hook, or reviewing/fixing hook tests.
metadata:
  version: "1.0.0"
---

# Test frontend hooks

Workflow and conventions for testing custom hooks in `frontend/src`. Not every
hook looks the same — some fetch and map API data, some derive values from
context/browser APIs, some manage local state — so pick the approach that
matches what the hook actually does rather than forcing one pattern.

## File layout

- Test file lives next to the hook, named `<hookFile>.test.ts` (use `.tsx`
  when the test needs JSX, e.g. for `renderHook` + a provider wrapper).
- After writing or editing a hook, always run `npx tsc --noEmit` in
  `frontend/` to catch type errors in the test file too.

## Validating tests

- Run with `npx vitest run <path_to_test_file>` from `frontend/`, or `npm test`
  for the whole suite.
- Whenever a test fails, report which test is failing and ask for input when
  you are not sure whether the bug is in the hook or the test.
- If unrelated tests start failing, don't change them to make them pass —
  report it.

## Picking a testing approach

- **If the hook's core logic can be expressed as a plain function** (e.g. a
  `fetchXxx`/mapping function wrapped by `useQuery`, or any pure
  transformation), export that function and test it directly with a plain
  `await`. This is simpler and less flaky than rendering the hook.
- **Use `renderHook`** (from `@testing-library/react`, with `waitFor`) when
  the behavior can't be captured by a single function call — state that
  accumulates across re-renders, values derived from multiple reactive
  sources, or hooks built on `useState`/`useMemo`/`useEffect`.
- Only wrap the test in a `QueryClientProvider` if the hook actually uses
  `useQuery`/`useMutation`. Hooks with no React Query involvement (e.g. ones
  wrapping `useSearchParams`, context, or other browser/React APIs) don't
  need it — just mock whatever they depend on and use `renderHook` directly,
  or a plain function call if there's no dependency on hook internals at
  all.

Boilerplate wrapper for hooks that do call `useQuery`:

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

function QueryClientWrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

Always set `retry: false` on the test `QueryClient` to avoid flaky/slow tests
on failed-request cases.

## Mocking dependencies

Mock whatever external dependency the hook actually touches, at the module
level, mocking only the specific functions/hooks used:

```ts
vi.mock("../../generated-client", () => ({
  listServiceProvidingGroupGridPrequalification: vi.fn(),
}));

const mockedList = vi.mocked(listServiceProvidingGroupGridPrequalification);
```

Reset mocks in `beforeEach` so state doesn't leak between tests:

```ts
beforeEach(() => {
  mockedList.mockReset();
});
```

Generated API client functions resolve to `{ data, error }` (consumed via
`throwOnError` from `../../util`). Mock the resolved value with that shape:

```ts
mockedList.mockResolvedValue({
  data: [/* ... */],
  error: undefined,
} as Awaited<ReturnType<typeof listServiceProvidingGroupGridPrequalification>>);
```

For hooks that build their query dynamically per call, use
`mockImplementation` and inspect the call's arguments to return different
fixtures per invocation.

For non-API dependencies (router hooks, context, browser APIs), mock the
same way — mock the module/hook, assert the values the hook under test reads
from and writes to it.

## Mock data helpers

Don't inline large object literals repeatedly. Write small `xxxFor(...)`
helper functions that take only the fields relevant to the test as
parameters and cast the rest away:

```ts
// Helper function for mock data
const prequalificationFor = (
  id: number,
  impactedSystemOperatorId: number,
): ServiceProvidingGroupGridPrequalification =>
  ({
    id,
    service_providing_group_id: 1,
    impacted_system_operator_id: impactedSystemOperatorId,
    status: "approved",
    prequalified_at: "2024-01-01T00:00:00Z",
  }) as unknown as ServiceProvidingGroupGridPrequalification;
```

- Cast through `as unknown as GeneratedType` rather than trying to satisfy
  the full generated type (which is often huge, with many optional/readonly
  fields irrelevant to the test).
- Import types from `../../generated-client` with `import type`.
- Keep the helper next to the tests, above `beforeEach`, with a
  `// Helper function for mock data` (or `// Mock data`) comment.

## What to assert

- **Happy path**: given representative input, the hook/function returns the
  expected output (mapped fields, derived/aggregated values, formatting).
- **Arguments passed to dependencies**: assert the exact query/filter/args
  passed to whatever was mocked, not just the final output.
- **Multi-call/reactive behavior** (for `renderHook`-based tests): additional
  inputs or rerenders trigger the expected updates without clobbering
  previous state.
- **Any non-trivial logic in the hook** (sorting, fallbacks, business rules)
  deserves its own test case — don't only test the trivial happy path.

## General guardrails

- **Never edit application/hook logic just to make a failing test pass.** If
  a test fails, that's a signal to report, not to silently fix by changing
  production code.
- **Ask when the expected behavior is unclear** — which fields belong in the
  view model, how a fallback should behave, what counts as an edge case
  worth covering. Don't guess at intended business logic.
- Keep tests focused on the hook's own logic — don't re-test the generated
  client, React Query, or React Router themselves.
- If a hook's core logic isn't exported yet, exporting it for testing is
  usually the simplest fix; don't reach for `renderHook` just to avoid
  exporting a function.
- Make tests that give value — don't chase edge cases that can't realistically
  happen.
- Match existing formatting/util usage (e.g. `toDateString` from
  `../../util`) instead of hand-rolling date/number formatting in
  expectations.
- Never introduce a new test/library dependency unless specifically asked
  for.
