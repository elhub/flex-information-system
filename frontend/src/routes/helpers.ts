import { routeDefs } from "./routeDefs";
import type { RouteName, RouteParams } from "./routeDefs";

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
 * Build a resolved URL path from a route name and params.
 * Replaces :param segments with provided values.
 */
export function buildPath<K extends RouteName>(
  route: K,
  ...args: RouteParams<K> extends never ? [] : [params: RouteParams<K>]
): string {
  const def = routeDefs[route];
  return resolvePath(def.path, (args[0] ?? {}) as Record<string, string>);
}
