# Context-Aware Back Button Design

**Date:** 2026-04-17
**Status:** Approved

## Problem

The back button in `ShowPageLayout` always navigates to a hardcoded list
page (e.g., "← Back to Controllable units"). When a user navigates from a
parent resource show page to a related resource (e.g., SPG show → CU show),
the button gives no indication of where they came from and does not return
them to the parent.

## Goal

The back button should reflect navigation history. If a user navigates from
SPG 42 to CU 7, the back button on the CU show page should say
"← Back to Service providing group 42" and return them to the SPG show page.

## Scope

All pages that use `ShowPageLayout`. Applies to all in-app navigation. Falls
back to the existing hardcoded `backTo` prop behavior when the user arrives
directly (bookmark, refresh, external link).

## Approach

**Option B (React context history + URL-to-label mapping)** was chosen over:

- Option A (pass label in router navigation state — requires updating every
  callsite)
- Option C (URL query params — pollutes URLs)

## Architecture

### 1. `NavigationHistoryProvider`

**Location:** `frontend/src/components/NavigationHistoryProvider.tsx`

A React context provider that tracks navigation history using react-router
v6 primitives:

- `useLocation()` — provides current `location.pathname` and `location.key`
  (unique per history entry)
- `useNavigationType()` — returns `'PUSH'`, `'POP'`, or `'REPLACE'`

**Stack behavior:**

- `PUSH`: append `{ key, pathname }` to the stack
- `POP`: trim the stack back to the entry matching the current
  `location.key` (handles browser back/forward correctly); if the key is
  not found in the stack, reset the stack to a single entry for the current
  location
- `REPLACE`: replace the last stack entry with the current location

**Exposed API:**

```ts
interface NavigationHistoryContextValue {
  previousEntry: { key: string; pathname: string } | null;
}

// Hook for consumers
export const usePreviousPage =
  (): { pathname: string; label: string } | null;
```

`usePreviousPage()` returns `null` if there is no previous entry (direct
access). If there is a previous entry, it calls
`getLabelForPath(previousEntry.pathname)` and returns both.

### 2. `routeLabels.ts`

**Location:** `frontend/src/navigation/routeLabels.ts`

A config array mapping URL patterns to human-readable labels. Patterns are
matched in order; the first match wins.

```ts
// Pattern format: regex with capture groups for IDs
// Label format: function from match → string

const ROUTE_LABELS = [
  // Show pages (specific first)
  {
    pattern: /^\/service_providing_group\/(\d+)\/show$/,
    label: (m) => `Service providing group ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/(\d+)\/show$/,
    label: (m) => `Controllable unit ${m[1]}`,
  },
  {
    pattern: /^\/accounting_point\/([^/]+)\/show$/,
    label: (m) => `Accounting point ${m[1]}`,
  },
  { pattern: /^\/party\/(\d+)\/show$/, label: (m) => `Party ${m[1]}` },
  { pattern: /^\/entity\/(\d+)\/show$/, label: (m) => `Entity ${m[1]}` },
  {
    pattern: /^\/product_type\/(\d+)\/show$/,
    label: (m) => `Product type ${m[1]}`,
  },
  // Nested show pages
  {
    pattern: /^\/controllable_unit\/\d+\/suspension\/(\d+)\/show$/,
    label: (m) => `Suspension ${m[1]}`,
  },
  {
    pattern: /^\/service_providing_group\/\d+\/membership\/(\d+)\/show$/,
    label: (m) => `Membership ${m[1]}`,
  },
  // List pages (fallback)
  {
    pattern: /^\/service_providing_group$/,
    label: () => "Service providing groups",
  },
  { pattern: /^\/controllable_unit$/, label: () => "Controllable units" },
  { pattern: /^\/accounting_point$/, label: () => "Accounting points" },
  { pattern: /^\/party$/, label: () => "Parties" },
  { pattern: /^\/entity$/, label: () => "Entities" },
  { pattern: /^\/product_type$/, label: () => "Product types" },
  // ... (one entry per resource, list + show)
] as const;

export function getLabelForPath(pathname: string): string;
```

The full list covers all resources in the app. Unmatched paths return a
generic `'Back'` label.

### 3. `ShowPageLayout` changes

**Location:** `frontend/src/components/ShowPageLayout.tsx`

- Import `usePreviousPage` hook
- If `usePreviousPage()` returns a value, override the back button
  destination and label
- The `backTo` prop is kept as the fallback for direct access

```tsx
const previousPage = usePreviousPage();
const backHref = previousPage?.pathname ?? backTo;
const backLabel = previousPage?.label ?? undefined;

// Render
<Button as={RouterLink} to={backHref} variant="invisible" icon={IconArrowLeft}>
  {backLabel ? `Back to ${backLabel}` : undefined}
</Button>;
```

### 4. `App.tsx` change

Wrap the `<Admin>` children (or the layout) with
`<NavigationHistoryProvider>`. Since `NavigationHistoryProvider` uses
react-router hooks, it must be rendered inside the router (which
react-admin's `<Admin>` provides).

## Data Flow

```text
User navigates: SPG show → CU show
  ↓
NavigationHistoryProvider sees PUSH with new location.key
  ↓
Stack: [{ key: 'abc', pathname: '/service_providing_group/42/show' },
        { key: 'def', pathname: '/controllable_unit/7/show' }]
  ↓
ShowPageLayout on CU show calls usePreviousPage()
  ↓
Returns { pathname: '/service_providing_group/42/show',
          label: 'Service providing group 42' }
  ↓
Back button renders: "← Back to Service providing group 42"
```

## Edge Cases

| Scenario                             | Behavior                                   |
| ------------------------------------ | ------------------------------------------ |
| Direct URL / page refresh            | Stack empty, falls back to `backTo` prop   |
| Browser back button used             | `POP` trims stack to matching key          |
| Edit/create success (`navigate(-1)`) | `POP` event, stack handled correctly       |
| URL not in `routeLabels.ts`          | Generic `'Back'` label                     |
| Tab opened from link                 | Stack starts fresh, falls back to `backTo` |

## Files Changed

| File                                                    | Change                                  |
| ------------------------------------------------------- | --------------------------------------- |
| `frontend/src/components/NavigationHistoryProvider.tsx` | New — context + hook                    |
| `frontend/src/navigation/routeLabels.ts`                | New — URL-to-label mapping              |
| `frontend/src/components/ShowPageLayout.tsx`            | Use `usePreviousPage()` hook            |
| `frontend/src/App.tsx`                                  | Wrap with `<NavigationHistoryProvider>` |

No navigate callsites need to change.

## Out of Scope

- Fetching record names from the API (label uses ID only, e.g.,
  "Service providing group 42")
- Breadcrumb trail (multiple levels shown simultaneously)
- Edit and Create page back buttons (currently use `navigate(-1)`, which
  already returns to the correct page)
