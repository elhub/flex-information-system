import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { routeDefs } from "./routeDefs";
import { resolvePath } from "./helpers";
import type { RouteName, RouteParams, RouteState } from "./routeDefs";

type TypedLinkProps<K extends RouteName> = {
  to: K;
  children: ReactNode;
  className?: string;
} & (RouteParams<K> extends never ? {} : { params: RouteParams<K> }) &
  (RouteState<K> extends never ? {} : { state?: RouteState<K> });

export function TypedLink<K extends RouteName>(props: TypedLinkProps<K>) {
  const { to, children, className, ...rest } = props;
  const params = ("params" in rest ? rest.params : {}) as Record<
    string,
    string
  >;
  const state = "state" in rest ? rest.state : undefined;

  const def = routeDefs[to];
  const path = resolvePath(def.path, params);

  return (
    <Link to={path} state={state} className={className}>
      {children}
    </Link>
  );
}
