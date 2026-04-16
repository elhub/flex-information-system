import type { RouteDef, ExtractParams } from "./types";

/**
 * Build a resolved URL path from a route definition and params.
 * Replaces :param segments with provided values.
 */
export function buildPath<
  TDefs extends Record<string, RouteDef>,
  K extends keyof TDefs & string,
>(
  defs: TDefs,
  route: K,
  ...args: ExtractParams<TDefs[K]> extends never
    ? []
    : [params: ExtractParams<TDefs[K]>]
): string {
  const def = defs[route];
  const params = (args[0] ?? {}) as Record<string, string>;
  return def.path.replace(/:([a-zA-Z_]+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(
        `Missing param "${key}" for route "${route}" (path: ${def.path})`,
      );
    }
    return encodeURIComponent(value);
  });
}
