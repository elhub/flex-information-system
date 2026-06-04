import {
  Admin,
  CustomRoutes,
  ResourceContextProvider,
  LayoutProps,
  localStorageStore,
} from "react-admin";

import { DataProvider } from "ra-core";

import { HashRouter, Route, Routes } from "react-router-dom";
import { apiURL, httpClient } from "./httpConfig";

import { authProvider } from "./auth";
import { elhubTheme } from "./theme";
import { LoginPage } from "./LoginPage";
import { AssumePartyPage } from "./AssumePartyPage";
import { PrivacyPolicyPage } from "./privacy-policy/PrivacyPolicyPage";
import { QueryClient } from "@tanstack/react-query";

import { createAllResources } from "./resources";

import { Dashboard } from "./dashboard/Dashboard";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import postgrestRestProvider, {
  IDataProviderConfig,
  defaultPrimaryKeys,
  defaultSchema,
} from "@raphiniert/ra-data-postgrest";

import { useI18nProvider } from "./intl/intl";
import { Header } from "./components/Header/Header";
import { NavigationHistoryProvider } from "./components/NavigationHistoryProvider";

const config: IDataProviderConfig = {
  apiUrl: apiURL,
  httpClient: httpClient,
  defaultListOp: "eq",
  primaryKeys: defaultPrimaryKeys,
  schema: defaultSchema,
};

const postgrestDataProvider = postgrestRestProvider(config);

// Some API resources that are not backed by a DB table have no IDs in their
// rows. For such cases to work properly, the getList must be overriden so that
// we add a dummy ID there and satisfy internal React Admin typing constraints.
// cf https://github.com/marmelab/react-admin/blob/27dccfb8519de551ef7e236355860aacef36ef56/packages/ra-core/src/types.ts#L12-L15
const dataProvider: DataProvider = {
  ...postgrestDataProvider,
  getList: (resource, params) =>
    postgrestDataProvider.getList(resource, params).then((response) => {
      const newData = response.data.map((record, i) =>
        record?.id ? record : { ...record, id: i },
      );
      return { ...response, data: newData };
    }),
};

const Layout = ({ children }: LayoutProps) => (
  <NavigationHistoryProvider>
    <Header />
    <div className="py-8 px-6 ">{children}</div>
    <ReactQueryDevtools initialIsOpen={false} />
  </NavigationHistoryProvider>
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
