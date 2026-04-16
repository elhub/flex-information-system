import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { routeDefs } from "./routeDefs";
import { resolvePath } from "./helpers";
import type { RouteName, RouteOpts } from "./routeDefs";

type TypedLinkProps<K extends RouteName> = {
  to: K;
  children: ReactNode;
  className?: string;
} & RouteOpts<K>;

export function TypedLink<K extends RouteName>(props: TypedLinkProps<K>) {
  const { to, children, className, ...rest } = props;
  const { params, state } = rest as {
    params?: Record<string, string>;
    state?: unknown;
  };

  const def = routeDefs[to];
  const path = resolvePath(def.path, params ?? {});

  return (
    <Link to={path} state={state} className={className}>
      {children}
    </Link>
  );
}
