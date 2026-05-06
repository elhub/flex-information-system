# embed Object Syntax Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the callback/Proxy-based `embed<T>()` API with a plain
object tree literal that is fully type-safe and produces identical output.

**Architecture:** Rewrite `frontend/src/lib/embed.ts` to accept an
`EmbedTree<T>` object instead of a callback. The recursive type reuses
existing `EmbeddableKeys<T>` and `EmbedElement<T>` helpers. A simple
tree-walk function replaces the Proxy runtime.

**Tech Stack:** TypeScript, Vitest

---

## Task 1: Update tests to use the new object API

**Files:**

- Modify: `frontend/src/lib/embed.test.ts`

Update all test cases to call `embed<T>()` with an object literal instead of
a callback. The expected output strings do not change — only the call syntax.

- [ ] **Step 1: Replace all test cases with object-literal style**

Replace the entire contents of `frontend/src/lib/embed.test.ts` with:

```ts
// frontend/src/lib/embed.test.ts
import { describe, expect, it } from "vitest";
import { embed } from "./embed";
import type {
  ControllableUnit,
  ServiceProvidingGroupMembership,
} from "../generated-client";

describe("embed", () => {
  it("returns empty string when no selections are made", () => {
    const result = embed<ControllableUnit>({});
    expect(result).toBe("");
  });

  it("embeds a single flat relation", () => {
    const result = embed<ControllableUnit>({ suspension: true });
    expect(result).toBe("suspension");
  });

  it("embeds multiple flat relations as comma-separated string", () => {
    const result = embed<ControllableUnit>({
      suspension: true,
      technical_resource: true,
    });
    expect(result).toBe("suspension,technical_resource");
  });

  it("embeds a nested relation", () => {
    const result = embed<ControllableUnit>({
      accounting_point: { bidding_zone: true },
    });
    expect(result).toBe("accounting_point(bidding_zone)");
  });

  it("embeds multiple nested relations", () => {
    const result = embed<ControllableUnit>({
      accounting_point: {
        bidding_zone: true,
        balance_responsible_party: true,
      },
    });
    expect(result).toBe(
      "accounting_point(bidding_zone,balance_responsible_party)",
    );
  });

  it("handles deeply nested embeds (real-world SPG membership case)", () => {
    const result = embed<ServiceProvidingGroupMembership>({
      controllable_unit: {
        accounting_point: {
          bidding_zone: true,
          balance_responsible_party: {
            balance_responsible_party: true,
          },
        },
      },
    });
    expect(result).toBe(
      "controllable_unit(accounting_point(bidding_zone," +
        "balance_responsible_party(balance_responsible_party)))",
    );
  });

  it("combines flat and nested relations", () => {
    const result = embed<ControllableUnit>({
      accounting_point: { bidding_zone: true },
      suspension: true,
    });
    expect(result).toBe("accounting_point(bidding_zone),suspension");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail (old implementation)**

```bash
cd frontend && pnpm run test -- src/lib/embed.test.ts
```

Expected: multiple type errors or test failures — the current `embed<T>()`
signature expects a callback, not an object.

---

## Task 2: Rewrite `embed.ts` with object API

**Files:**

- Modify: `frontend/src/lib/embed.ts`

Replace the Proxy-based implementation with `EmbedTree<T>` type and a
recursive tree-walk function.

- [ ] **Step 1: Replace the entire file contents**

```ts
/**
 * embed — type-safe PostgREST embed string builder
 *
 * Usage:
 *   embed<ControllableUnit>({
 *     accounting_point: {
 *       bidding_zone: true,
 *     },
 *     suspension: true,
 *   })
 *   // => "accounting_point(bidding_zone),suspension"
 *
 * How it works:
 *
 * 1. `EmbeddableKeys<T>` narrows T's keys to only those whose value type is
 *    `SomeEntity | null` or `Array<SomeEntity> | null`. This matches exactly
 *    how PostgREST embeddable relations are typed in types.gen.ts — scalars
 *    and non-nullable inline objects are excluded.
 *
 * 2. `EmbedTree<T>` is a mapped type where each embeddable key maps to
 *    either `true` (include with no sub-selection) or a nested `EmbedTree`
 *    (include with sub-selection). All keys are optional.
 *
 * 3. At runtime, `buildEmbed` recursively walks the tree and produces the
 *    PostgREST embed string. No Proxy is needed — plain object iteration.
 */

/** Keys of T whose value type is nullable and whose non-null type is an
 * object (i.e. embeddable). */
type EmbeddableKeys<T> = {
  [K in keyof T]-?: null extends T[K]
    ? NonNullable<T[K]> extends object
      ? K
      : never
    : never;
}[keyof T];

/** Unwrap Array<U> | null → U, or SomeType | null → SomeType. */
type EmbedElement<T> =
  NonNullable<T> extends Array<infer U> ? U : NonNullable<T>;

/** A plain object tree describing which relations to embed. */
export type EmbedTree<T> = {
  [K in EmbeddableKeys<T>]?: true | EmbedTree<EmbedElement<T[K]>>;
};

/**
 * Recursively walks an embed tree and builds a PostgREST embed string.
 */
function buildEmbed(tree: Record<string, unknown>): string {
  return Object.entries(tree)
    .map(([key, val]) =>
      val === true
        ? key
        : `${key}(${buildEmbed(val as Record<string, unknown>)})`,
    )
    .join(",");
}

/**
 * Builds a PostgREST embed query string for the given entity type T.
 *
 * @param tree - Object describing which relations to embed. Keys are
 *   embeddable relation names; values are `true` for a flat embed or a
 *   nested `EmbedTree` for a sub-selection.
 * @returns Comma-separated PostgREST embed string, or "" if tree is empty.
 *
 * @example
 *   embed<ControllableUnit>({
 *     accounting_point: {
 *       bidding_zone: true,
 *     },
 *     suspension: true,
 *   })
 *   // => "accounting_point(bidding_zone),suspension"
 */
export function embed<T>(tree: EmbedTree<T>): string {
  return buildEmbed(tree as Record<string, unknown>);
}
```

- [ ] **Step 2: Run tests to verify they all pass**

```bash
cd frontend && pnpm run test -- src/lib/embed.test.ts
```

Expected: all 7 tests pass.

- [ ] **Step 3: Type-check the whole frontend**

```bash
cd frontend && pnpm run type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/embed.ts frontend/src/lib/embed.test.ts
git commit -m "refactor: replace embed callback API with object tree syntax"
```
