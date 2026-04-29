# Design: Replace `embed<T>()` callback syntax with object tree syntax

**Date:** 2026-04-29  
**Status:** Approved

## Problem

The existing `embed<T>()` function in `frontend/src/lib/embed.ts` uses a
Proxy-based callback/selector API:

```ts
embed<ControllableUnit>((s) => {
  s.accounting_point((a) => {
    a.bidding_zone();
  });
  s.suspension();
});
```

This is not readable or ergonomic — the nesting reads inside-out compared to
how you'd naturally describe the shape you want.

## Goal

Change the declaration syntax to a plain object tree literal while keeping:

- The same PostgREST `?select=` string output
- Full TypeScript type safety (only valid embeddable relation keys allowed)

## Design

### Type layer

Two existing helper types are reused unchanged:

- `EmbeddableKeys<T>` — narrows `T`'s keys to only nullable object/array relations
- `EmbedElement<T>` — unwraps `Array<U> | null → U` or `SomeType | null → SomeType`

New recursive type:

```ts
type EmbedTree<T> = {
  [K in EmbeddableKeys<T>]?: true | EmbedTree<EmbedElement<T[K]>>;
};
```

- `true` means include the relation with no sub-selection
- A nested `EmbedTree` means include with sub-selection

### Runtime

Replace `makeSelector` (Proxy-based) with a simple recursive tree-walk:

```ts
function buildEmbed(tree: Record<string, unknown>): string {
  return Object.entries(tree)
    .map(([key, val]) =>
      val === true
        ? key
        : `${key}(${buildEmbed(val as Record<string, unknown>)})`,
    )
    .join(",");
}
```

### Public API

```ts
export function embed<T>(tree: EmbedTree<T>): string;
```

### Usage example

```ts
embed<ControllableUnit>({
  accounting_point: {
    bidding_zone: true,
    balance_responsible_party: { balance_responsible_party: true },
  },
});
// => "accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party))"
```

## Changes

- `frontend/src/lib/embed.ts`: remove `EmbedSelector`, `makeSelector`, and
  callback implementation; add `EmbedTree<T>` type and `buildEmbed` runtime;
  update `embed<T>()` signature to accept `EmbedTree<T>`
- Update JSDoc examples to reflect new syntax

## Non-changes

- `EmbeddableKeys<T>` and `EmbedElement<T>` types are unchanged
- Output string format is identical — no downstream impact
- No call sites exist yet, so no migration needed
