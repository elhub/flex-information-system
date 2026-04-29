/**
 * embed — type-safe PostgREST embed string builder
 *
 * Usage:
 *   embed<ControllableUnit>(s => {
 *     s.accounting_point(a => {
 *       a.bidding_zone()
 *     })
 *     s.suspension()
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
 * 2. `EmbedSelector<T>` is a mapped type that exposes one method per
 *    embeddable key. Each method accepts an optional sub-selector callback for
 *    nested embeds.
 *
 * 3. At runtime, `makeSelector` returns a Proxy that intercepts property
 *    access. When a method is called, the key (and any nested parts) are
 *    pushed into a `parts` array. No enumeration of schema keys is needed —
 *    TypeScript enforces validity at compile time; the Proxy handles dispatch
 *    at runtime.
 */

/** Keys of T whose value type is nullable and whose non-null type is an object (i.e. embeddable). */
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

/** A selector object whose keys are the embeddable relations of T. */
type EmbedSelector<T> = {
  [K in EmbeddableKeys<T>]: (
    sub?: (s: EmbedSelector<EmbedElement<T[K]>>) => void,
  ) => void;
};

/**
 * Creates a Proxy-backed selector that records embed parts into `parts`.
 *
 * The Proxy intercepts property access and returns a function. When called:
 * - Without a sub-callback: the key is pushed directly (e.g. "suspension").
 * - With a sub-callback: a child parts array is populated recursively, then
 *   the key is pushed with child parts in parentheses
 *   (e.g. "accounting_point(bidding_zone)").
 */
function makeSelector<T>(parts: string[]): EmbedSelector<T> {
  return new Proxy({} as EmbedSelector<T>, {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      return (sub?: (s: EmbedSelector<unknown>) => void) => {
        if (sub) {
          const childParts: string[] = [];
          sub(makeSelector(childParts));
          parts.push(`${key}(${childParts.join(",")})`);
        } else {
          parts.push(key);
        }
      };
    },
  });
}

/**
 * Builds a PostgREST embed query string for the given entity type T.
 *
 * @param build - Callback that receives a typed selector. Call selector
 *   methods to include relations; pass a sub-callback for nested embeds.
 * @returns Comma-separated PostgREST embed string, or "" if nothing selected.
 *
 * @example
 *   embed<ControllableUnit>(s => {
 *     s.accounting_point(a => { a.bidding_zone() })
 *     s.suspension()
 *   })
 *   // => "accounting_point(bidding_zone),suspension"
 */
export function embed<T>(build: (s: EmbedSelector<T>) => void): string {
  const parts: string[] = [];
  build(makeSelector<T>(parts));
  return parts.join(",");
}
