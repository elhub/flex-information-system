import type { RouteDef, ExtractParams } from "./types";

/**
 * Replace :param segments in a path template with values from params.
 */
export function resolvePath(
  pathTemplate: string,
  params: Record<string, string>,
): string {
  return pathTemplate.replace(/:([a-zA-Z_]+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing param "${key}" for path "${pathTemplate}"`);
    }
    return encodeURIComponent(value);
  });
}

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
  return resolvePath(def.path, params);
}
