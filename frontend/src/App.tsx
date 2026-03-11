import {
  Admin,
  CustomRoutes,
  ResourceContextProvider,
  Layout as RaLayout,
  LayoutProps,
  localStorageStore,
} from "react-admin";
import { Box } from "@mui/material";

import { DataProvider } from "ra-core";

import { Route } from "react-router-dom";
import { apiURL, serverURL, httpClient, authURL, docsURL } from "./httpConfig";

import { authProvider } from "./auth";

import { Breadcrumbs } from "./components/Breadcrumbs";
import { elhubTheme } from "./theme";
import { LoginPage } from "./LoginPage";
import { AssumePartyPage } from "./AssumePartyPage";

import { createAllResources } from "./resources";

import { Dashboard } from "./Dashboard";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import postgrestRestProvider, {
  IDataProviderConfig,
  defaultPrimaryKeys,
  defaultSchema,
} from "@raphiniert/ra-data-postgrest";

import { useI18nProvider } from "./intl/intl";
import { Header } from "./components/Header/Header";

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

const FooterButton = ({ href, label }: any) => (
  <a
    style={{
      display: "inline-block",
      padding: "2px 8px",
      border: `1px solid ${elhubTheme.palette.background.default}`,
      color: elhubTheme.palette.background.default,
      borderRadius: "3px",
      textDecoration: "none",
    }}
    href={href}
  >
    {label}
  </a>
);

const Layout = ({ children }: LayoutProps) => (
  <>
    <RaLayout menu={() => null} appBar={Header}>
      <div className="pt-[104px]">
        <Breadcrumbs />
        {children}
        <Box m={3} />
      </div>
    </RaLayout>
    <ReactQueryDevtools initialIsOpen={false} />
    <footer className="fixed z-10 bottom-0 left-0 w-full flex justify-center items-center p-2 bg-semantic-background-action-primary">
      <FooterButton href={serverURL} label="Portal" />
      <FooterButton href={docsURL} label="Project documentation" />
      <FooterButton href={apiURL} label="Main API documentation" />
      <FooterButton href={authURL} label="Auth API documentation" />
    </footer>
  </>
);

export const App = () => (
  <Admin
    authProvider={authProvider()}
    i18nProvider={useI18nProvider()}
    dashboard={Dashboard}
    dataProvider={dataProvider}
    disableTelemetry
    layout={Layout}
    loginPage={LoginPage}
    requireAuth={true}
    store={localStorageStore(undefined, "Flex")}
    theme={elhubTheme}
  >
    {(permissions) =>
      permissions.allow ? <>{createAllResources(permissions)}</> : null
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
);
