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
