import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { routeDefs } from "./routeDefs";
import type { RouteDef } from "./types";
import { AccessGate } from "./AccessGate";
import { Loader } from "../components/ui";

/**
 * Renders all routes from routeDefs as flat <Route> elements.
 * Each route is wrapped with Suspense (for lazy loading) and AccessGate
 * (for permission checks).
 */
export const AppRoutes = () => (
  <Routes>
    {(Object.entries(routeDefs) as [string, RouteDef][]).map(([key, def]) => (
      <Route
        key={key}
        path={def.path}
        element={
          <Suspense fallback={<Loader />}>
            <AccessGate access={def.access}>
              <def.component />
            </AccessGate>
          </Suspense>
        }
      />
    ))}
  </Routes>
);
