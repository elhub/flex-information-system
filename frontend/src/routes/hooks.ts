import { useParams, useLocation, useNavigate } from "react-router-dom";
import { routeDefs } from "./routeDefs";
import type { RouteName, RouteParams, RouteState } from "./routeDefs";

/**
 * Typed wrapper around useParams(). Validates params against the route's Zod
 * schema at runtime in development.
 */
export function useTypedParams<K extends RouteName>(route: K): RouteParams<K> {
  const raw = useParams();
  const def = routeDefs[route];
  if ("params" in def && def.params) {
    const result = def.params.safeParse(raw);
    if (!result.success) {
      if (import.meta.env.DEV) {
        console.error(
          `[useTypedParams] Invalid params for route "${route}":`,
          result.error.format(),
        );
      }
      return raw as RouteParams<K>;
    }
    return result.data as RouteParams<K>;
  }
  return raw as RouteParams<K>;
}

/**
 * Typed wrapper around useLocation().state. Validates against the route's
 * locationState Zod schema. Returns undefined if state is missing or invalid.
 */
export function useTypedLocationState<K extends RouteName>(
  route: K,
): RouteState<K> | undefined {
  const { state } = useLocation();
  if (state == null) return undefined;
  const def = routeDefs[route];
  if (!("locationState" in def) || !def.locationState) return undefined;
  const result = def.locationState.safeParse(state);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn(
        `[useTypedLocationState] Invalid state for route "${route}":`,
        result.error.format(),
      );
    }
    return undefined;
  }
  return result.data as RouteState<K>;
}

/**
 * Typed wrapper around useNavigate(). Provides compile-time safety for route
 * names, params, and location state.
 */
export function useTypedNavigate() {
  const navigate = useNavigate();

  return function typedNavigate<K extends RouteName>(
    route: K,
    ...args: RouteParams<K> extends never
      ? RouteState<K> extends never
        ? []
        : [options?: { state?: RouteState<K> }]
      : RouteState<K> extends never
        ? [options: { params: RouteParams<K> }]
        : [options: { params: RouteParams<K>; state?: RouteState<K> }]
  ) {
    const options = args[0] as
      | { params?: Record<string, string>; state?: unknown }
      | undefined;
    const def = routeDefs[route];
    const params = (options?.params ?? {}) as Record<string, string>;
    const path = def.path.replace(/:([a-zA-Z_]+)/g, (_, key: string) => {
      const value = params[key];
      if (value === undefined) {
        throw new Error(`Missing param "${key}" for route "${route}"`);
      }
      return encodeURIComponent(value);
    });
    navigate(path, { state: options?.state });
  };
}
