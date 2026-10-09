import {
  Admin,
  CustomRoutes,
  ResourceContextProvider,
  LayoutProps,
  localStorageStore,
} from "react-admin";

import { HashRouter, Route, Routes } from "react-router-dom";

import { authProvider } from "./auth";
import { elhubTheme } from "./theme";
import { LoginPage } from "./LoginPage";
import { AssumePartyPage } from "./AssumePartyPage";
import { PrivacyPolicyPage } from "./privacy-policy/PrivacyPolicyPage";
import { QueryClient } from "@tanstack/react-query";

import { createAllResources } from "./resources";

import { Dashboard } from "./dashboard/Dashboard";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useI18nProvider } from "./intl/intl";
import { dataProvider } from "./dataProvider";
import { Header } from "./components/Header/Header";
import { SessionExpiryBanner } from "./components/SessionExpiryBanner";

const Layout = ({ children }: LayoutProps) => (
  <>
    <Header />
    <SessionExpiryBanner />
    <div className="py-8 px-6 ">{children}</div>
    <ReactQueryDevtools initialIsOpen={false} />
  </>
);

// shared QueryClient instance used by both the Admin component and the auth
// provider (allows auth provider to invalidate permissions cache after
// checkAuth populates local storage)
const queryClient = new QueryClient();

export const App = () => {
  return (
    <HashRouter>
      <Routes>
        {/* no auth */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        {/* auth */}
        <Route
          path="/*"
          element={
            <Admin
              authProvider={authProvider(queryClient)}
              i18nProvider={useI18nProvider()}
              dashboard={Dashboard}
              dataProvider={dataProvider}
              disableTelemetry
              layout={Layout}
              loginPage={LoginPage}
              queryClient={queryClient}
              requireAuth={true}
              store={localStorageStore(undefined, "Flex")}
              theme={elhubTheme}
            >
              {(permissions) =>
                permissions.allow ? (
                  <>{createAllResources(permissions)}</>
                ) : null
              }
              <CustomRoutes>
                <Route
                  path="/login/assumeParty"
                  element={
                    <ResourceContextProvider value="party_membership">
                      <AssumePartyPage />
                    </ResourceContextProvider>
                  }
                />
              </CustomRoutes>
            </Admin>
          }
        />
      </Routes>
    </HashRouter>
  );
};
