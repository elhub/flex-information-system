import type { z } from "zod";
import type { LazyExoticComponent, ComponentType } from "react";

export type RouteDef = {
  /** URL path pattern, e.g. "/controllable_unit/:id/show" */
  path: string;
  /** Zod schema for URL params. Keys must match :param segments in path. */
  params?: z.ZodObject<Record<string, z.ZodString>>;
  /** Zod schema for location state passed via navigate/Link. */
  locationState?: z.ZodType;
  /** Permission required to access this route, e.g. "controllable_unit.read". */
  access?: string;
  /** Lazy-loaded page component. */
  component: LazyExoticComponent<ComponentType>;
};

/**
 * Extract params type for a route. Returns `never` if route has no params.
 */
export type ExtractParams<T extends RouteDef> = T extends {
  params: z.ZodType<infer P>;
}
  ? P
  : never;

/**
 * Extract location state type for a route. Returns `never` if route has no
 * locationState.
 */
export type ExtractState<T extends RouteDef> = T extends {
  locationState: z.ZodType<infer S>;
}
  ? S
  : never;

/**
 * Builds the props/options shape for navigating to a route.
 *
 * - If the route has URL params, `params` is required.
 * - If the route has no params, `params` is omitted.
 * - If the route has a locationState schema, `state` is optional.
 * - If the route has no locationState, `state` is omitted.
 *
 * Usage: `RouteOpts<K> & { to: K }` for navigate, or
 *        `RouteOpts<K> & { to: K; children: ReactNode }` for links.
 */
export type RouteOpts<_K extends string, TDef extends RouteDef = RouteDef> = ([
  ExtractParams<TDef>,
] extends [never]
  ? object
  : { params: ExtractParams<TDef> }) &
  ([ExtractState<TDef>] extends [never]
    ? object
    : { state?: ExtractState<TDef> });
