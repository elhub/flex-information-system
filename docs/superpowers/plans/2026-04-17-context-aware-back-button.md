# Context-Aware Back Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded back button in `ShowPageLayout` with one
that shows the previous page's label when navigating in-app (e.g.,
"← Back to Service providing group 42").

**Architecture:** A `NavigationHistoryProvider` tracks a stack of
`{ key, pathname }` using react-router's `useLocation` and
`useNavigationType` hooks. A `routeLabels.ts` config maps URL patterns
to human-readable labels. `ShowPageLayout` reads the previous entry via
a `usePreviousPage()` hook and uses it when present, falling back to the
existing `backTo` prop.

**Tech Stack:** React, react-router-dom v6, TypeScript

---

## File Map

| File                                                    | Action | Responsibility                                 |
| ------------------------------------------------------- | ------ | ---------------------------------------------- |
| `frontend/src/navigation/routeLabels.ts`                | Create | URL pattern → label mapping + helper           |
| `frontend/src/components/NavigationHistoryProvider.tsx` | Create | History stack context + `usePreviousPage` hook |
| `frontend/src/components/ShowPageLayout.tsx`            | Modify | Use `usePreviousPage()` for back button        |
| `frontend/src/App.tsx`                                  | Modify | Wrap `Layout` with `NavigationHistoryProvider` |

---

## Task 1: Create `routeLabels.ts`

**Files:**

- Create: `frontend/src/navigation/routeLabels.ts`

- [ ] **Step 1: Create the file**

```ts
type RouteLabel = {
  pattern: RegExp;
  label: (match: RegExpMatchArray) => string;
};

const ROUTE_LABELS: RouteLabel[] = [
  // Top-level show pages
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
  {
    pattern: /^\/party\/(\d+)\/show$/,
    label: (m) => `Party ${m[1]}`,
  },
  {
    pattern: /^\/entity\/(\d+)\/show$/,
    label: (m) => `Entity ${m[1]}`,
  },
  {
    pattern: /^\/product_type\/(\d+)\/show$/,
    label: (m) => `Product type ${m[1]}`,
  },
  // Nested under controllable_unit
  {
    pattern: /^\/controllable_unit\/\d+\/suspension\/(\d+)\/show$/,
    label: (m) => `Suspension ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/\d+\/service_provider\/(\d+)\/show$/,
    label: (m) => `Service provider ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/\d+\/technical_resource\/(\d+)\/show$/,
    label: (m) => `Technical resource ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/\d+\/suspension_history\/(\d+)\/show$/,
    label: (m) => `Suspension history ${m[1]}`,
  },
  {
    pattern:
      /^\/controllable_unit\/\d+\/suspension\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  {
    pattern:
      /^\/controllable_unit\/\d+\/service_provider_history\/(\d+)\/show$/,
    label: (m) => `Service provider history ${m[1]}`,
  },
  {
    pattern:
      /^\/controllable_unit\/\d+\/technical_resource_history\/(\d+)\/show$/,
    label: (m) => `Technical resource history ${m[1]}`,
  },
  // Nested under service_providing_group
  {
    pattern: /^\/service_providing_group\/\d+\/membership\/(\d+)\/show$/,
    label: (m) => `Membership ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/membership_history\/(\d+)\/show$/,
    label: (m) => `Membership history ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_prequalification\/(\d+)\/show$/,
    label: (m) => `Grid prequalification ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_prequalification_history\/(\d+)\/show$/,
    label: (m) => `Grid prequalification history ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/product_application\/(\d+)\/show$/,
    label: (m) => `Product application ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/product_application_history\/(\d+)\/show$/,
    label: (m) => `Product application history ${m[1]}`,
  },
  {
    pattern: /^\/service_providing_group\/\d+\/grid_suspension\/(\d+)\/show$/,
    label: (m) => `Grid suspension ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_suspension_history\/(\d+)\/show$/,
    label: (m) => `Grid suspension history ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_prequalification\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/product_application\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_suspension\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  // Nested under entity
  {
    pattern: /^\/entity\/\d+\/client\/(\d+)\/show$/,
    label: (m) => `Client ${m[1]}`,
  },
  // Top-level list pages (fallbacks)
  {
    pattern: /^\/service_providing_group$/,
    label: () => "Service providing groups",
  },
  {
    pattern: /^\/controllable_unit$/,
    label: () => "Controllable units",
  },
  {
    pattern: /^\/accounting_point$/,
    label: () => "Accounting points",
  },
  { pattern: /^\/party$/, label: () => "Parties" },
  { pattern: /^\/entity$/, label: () => "Entities" },
  { pattern: /^\/product_type$/, label: () => "Product types" },
];

export function getLabelForPath(pathname: string): string {
  for (const { pattern, label } of ROUTE_LABELS) {
    const match = pathname.match(pattern);
    if (match) return label(match);
  }
  return "Back";
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && pnpm run type-check
```

Expected: no errors related to `routeLabels.ts`.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/navigation/routeLabels.ts
git commit -m "feat: add route label mapping for context-aware back button"
```

---

## Task 2: Create `NavigationHistoryProvider`

**Files:**

- Create: `frontend/src/components/NavigationHistoryProvider.tsx`

- [ ] **Step 1: Create the provider and hook**

```tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { getLabelForPath } from "../navigation/routeLabels";

type HistoryEntry = {
  key: string;
  pathname: string;
};

type NavigationHistoryContextValue = {
  stack: HistoryEntry[];
};

const NavigationHistoryContext = createContext<NavigationHistoryContextValue>({
  stack: [],
});

const InnerProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [stack, setStack] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const entry: HistoryEntry = {
      key: location.key,
      pathname: location.pathname,
    };

    if (navigationType === "PUSH") {
      setStack((prev) => [...prev, entry]);
    } else if (navigationType === "POP") {
      setStack((prev) => {
        const idx = prev.findIndex((e) => e.key === location.key);
        if (idx === -1) return [entry];
        return prev.slice(0, idx + 1);
      });
    } else {
      // REPLACE
      setStack((prev) => {
        if (prev.length === 0) return [entry];
        return [...prev.slice(0, -1), entry];
      });
    }
  }, [location.key, location.pathname, navigationType]);

  return (
    <NavigationHistoryContext.Provider value={{ stack }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export const NavigationHistoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => <InnerProvider>{children}</InnerProvider>;

export const usePreviousPage = (): {
  pathname: string;
  label: string;
} | null => {
  const { stack } = useContext(NavigationHistoryContext);
  if (stack.length < 2) return null;
  const previous = stack[stack.length - 2];
  return {
    pathname: previous.pathname,
    label: getLabelForPath(previous.pathname),
  };
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && pnpm run type-check
```

Expected: no errors related to `NavigationHistoryProvider.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/NavigationHistoryProvider.tsx
git commit -m "feat: add NavigationHistoryProvider for back button context"
```

---

## Task 3: Wire `NavigationHistoryProvider` into `App.tsx`

**Files:**

- Modify: `frontend/src/App.tsx`

The `NavigationHistoryProvider` uses `useLocation` and
`useNavigationType` from react-router, so it must render inside
react-admin's `<Admin>` (which sets up the router). The right place is
inside the `Layout` component, which is already inside the router.

- [ ] **Step 1: Update `App.tsx`**

Replace the `Layout` component definition (lines 58–64):

```tsx
// Before:
const Layout = ({ children }: LayoutProps) => (
  <>
    <Header />
    <div className="py-8 px-6 ">{children}</div>
    <ReactQueryDevtools initialIsOpen={false} />
  </>
);

// After:
import { NavigationHistoryProvider } from "./components/NavigationHistoryProvider";

const Layout = ({ children }: LayoutProps) => (
  <NavigationHistoryProvider>
    <Header />
    <div className="py-8 px-6 ">{children}</div>
    <ReactQueryDevtools initialIsOpen={false} />
  </NavigationHistoryProvider>
);
```

Note: add the import at the top of the file with the other local imports.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && pnpm run type-check
```

Expected: no errors.

- [ ] **Step 3: Verify dev server starts without errors**

```bash
cd frontend && pnpm run build 2>&1 | tail -20
```

Expected: build succeeds (or only pre-existing warnings).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: wire NavigationHistoryProvider into app layout"
```

---

## Task 4: Update `ShowPageLayout` to use context

**Files:**

- Modify: `frontend/src/components/ShowPageLayout.tsx`

Currently `ShowPageLayout` is a concise arrow function returning JSX.
We need to convert it to a block-body function so hooks can be used.

- [ ] **Step 1: Rewrite `ShowPageLayout.tsx`**

Replace the entire file:

```tsx
import { IconArrowLeft } from "@elhub/ds-icons";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { usePreviousPage } from "./NavigationHistoryProvider";
import { Button, Heading } from "./ui";

type ShowPageLayoutProps = {
  backTo: string;
  title: string;
  badge?: ReactNode;
  alerts?: ReactNode;
  actionBar?: ReactNode;
  children: [ReactNode, ReactNode];
};

export const ShowPageLayout = ({
  backTo,
  title,
  badge,
  alerts,
  actionBar,
  children: [leftPanel, rightPanel],
}: ShowPageLayoutProps) => {
  const previousPage = usePreviousPage();
  const backHref = previousPage?.pathname ?? backTo;
  const backLabel = previousPage ? `Back to ${previousPage.label}` : undefined;

  return (
    <div className="flex flex-col gap-4 p-2">
      {alerts}
      <div className="flex items-center gap-2">
        <Button
          as={RouterLink}
          to={backHref}
          variant="invisible"
          icon={IconArrowLeft}
          iconPosition="left"
        >
          {backLabel}
        </Button>
        <Heading level={2} size="medium">
          {title}
        </Heading>
        {badge && <div className="flex items-center gap-1">{badge}</div>}
      </div>
      {actionBar}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[475px_minmax(0,1fr)]">
        {leftPanel}
        {rightPanel}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && pnpm run type-check
```

Expected: no errors.

- [ ] **Step 3: Lint**

```bash
cd frontend && pnpm run lint
```

Expected: no errors (or only pre-existing ones).

- [ ] **Step 4: Build to confirm no regressions**

```bash
cd frontend && pnpm run build 2>&1 | tail -20
```

Expected: successful build.

- [ ] **Step 5: Manual smoke test**

Start the dev server (`pnpm run dev`) and verify:

1. Open the SPG list page. Back button on SPG show page shows icon only
   (no history). It navigates to `/service_providing_group`.
2. Navigate from SPG list → click a row (SPG show). Back button still
   shows icon only (came from list, label = "Service providing groups" or
   falls back).
3. From SPG show, click a controllable unit row. On the CU show page,
   back button should say "← Back to Service providing group {id}".
4. Click the back button. Should return to that SPG show page.
5. Refresh the CU show page. Back button reverts to icon-only (no history),
   navigates to `/controllable_unit` (the `backTo` fallback).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ShowPageLayout.tsx
git commit -m "feat: show context-aware back button label in ShowPageLayout"
```

---

## Self-Review Checklist

- **Spec coverage:** All tasks map to spec requirements.
- **No placeholders:** All steps include complete code.
- **Type consistency:** All types and function signatures are consistent
  across tasks.
