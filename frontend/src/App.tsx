import { useState, ReactNode, createElement } from "react";
import {
  Admin,
  CustomRoutes,
  getStorage,
  ResourceContextProvider,
  Layout as RaLayout,
  LayoutProps,
  localStorageStore,
  AppBar as RaAppBar,
  TitlePortal,
  Menu,
  UserMenu,
  useGetIdentity,
  useRedirect,
  useUserMenu,
  useCreatePath,
  MenuItemLink,
} from "react-admin";
import {
  Chip,
  CircularProgress,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Collapse from "@mui/material/Collapse";

import DefaultIcon from "@mui/icons-material/ViewList";
import {
  useResourceDefinitions,
  useGetResourceLabel,
  useCanAccess,
  DataProvider,
} from "ra-core";

import { Route } from "react-router-dom";
import { apiURL, serverURL, httpClient, authURL, docsURL } from "./httpConfig";

import { authProvider, sessionInfoKey } from "./auth";

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

import { roleNames } from "./roles";

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

const RedirectMenuButton = (props: { label: string; url: string }) => {
  const redirect = useRedirect();
  const userMenu = useUserMenu();

  return (
    <MenuItem
      onClick={() => {
        userMenu?.onClose();
        redirect(props.url);
      }}
    >
      <ListItemIcon>
        <PeopleAltIcon />
      </ListItemIcon>
      <ListItemText>{props.label}</ListItemText>
    </MenuItem>
  );
};

// We implement a custom logout button since we don't want the default
// logout to redirect to our external auth service, since it is called by
// both checkAuth and checkError in the authProvider.
//
// Only user-initiated logout should go to the external auth service.
const Logout = () => {
  const redirect = useRedirect();
  const userMenu = useUserMenu();

  return (
    <MenuItem
      onClick={() => {
        getStorage().removeItem(sessionInfoKey);
        userMenu?.onClose();
        redirect(`${authURL}/logout`);
      }}
    >
      <ListItemIcon>
        <PeopleAltIcon />
      </ListItemIcon>
      <ListItemText>Logout</ListItemText>
    </MenuItem>
  );
};

const AppBar = () => {
  const redirect = useRedirect();
  const { isLoading, data, error } = useGetIdentity();
  if (error) redirect("/login");

  return (
    <RaAppBar
      userMenu={
        <UserMenu>
          {!isLoading && (
            <RedirectMenuButton
              url="/login/assumeParty"
              label={data!.partyID ? "Unassume party" : "Assume party"}
            />
          )}
          {!isLoading && (
            <RedirectMenuButton
              url={`/entity/${data!.entityID}/show`}
              label="My entity"
            />
          )}
          {!isLoading && data!.partyID && (
            <RedirectMenuButton
              url={`/party/${data!.partyID}/show`}
              label="My party"
            />
          )}
          <Logout />
        </UserMenu>
      }
    >
      <TitlePortal />
      {isLoading && <CircularProgress size={25} thickness={2} />}
      <Chip
        label={isLoading ? "..." : roleNames[data!.role]}
        variant="outlined"
        style={{ color: elhubTheme.palette.primary.contrastText }}
      />
    </RaAppBar>
  );
};

const SubMenu = ({
  text,
  defaultOpen,
  children,
}: {
  text: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemIcon>
        <ListItemText primary={text} />
      </MenuItem>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        sx={{
          "& .RaMenuItemLink-icon": {
            paddingLeft: 1,
          },
        }}
      >
        {children}
      </Collapse>
    </>
  );
};

// ResourceMenuItem + label override
export const LabelledResourceMenuItem = ({
  name,
  label,
}: {
  name: string;
  label: string;
}) => {
  const resources = useResourceDefinitions();
  const { canAccess, error, isPending } = useCanAccess({
    action: "list",
    resource: name,
  });
  const getResourceLabel = useGetResourceLabel();
  const createPath = useCreatePath();
  if (
    !resources ||
    !resources[name] ||
    isPending ||
    canAccess === false ||
    error != null
  )
    return null;

  return (
    <MenuItemLink
      to={createPath({ resource: name, type: "list" })}
      state={{ _scrollToTop: true }}
      primaryText={label ?? <>{getResourceLabel(name, 2)}</>}
      leftIcon={
        resources[name]?.icon ? (
          createElement(resources[name]?.icon)
        ) : (
          <DefaultIcon />
        )
      }
    />
  );
};

const MainMenu = () => (
  <Menu>
    <Menu.DashboardItem />
    <SubMenu text="Basic resources" defaultOpen>
      <LabelledResourceMenuItem
        name="controllable_unit"
        label="CU registrations"
      />
      <LabelledResourceMenuItem
        name="service_providing_group"
        label="SPG registrations"
      />
      <LabelledResourceMenuItem
        name="service_providing_group_membership"
        label="SPG memberships"
      />
      <LabelledResourceMenuItem
        name="service_providing_group_grid_prequalification"
        label="SPG grid prequalifications"
      />
    </SubMenu>
    <SubMenu text="Product application" defaultOpen>
      <LabelledResourceMenuItem
        name="service_provider_product_application"
        label="SP product applications"
      />
      <LabelledResourceMenuItem
        name="service_providing_group_product_application"
        label="SPG product applications"
      />
      <LabelledResourceMenuItem
        name="service_provider_product_suspension"
        label="SP product suspensions"
      />
    </SubMenu>
    <SubMenu text="Product type">
      <Menu.ResourceItem name="product_type" />
      <LabelledResourceMenuItem
        name="system_operator_product_type"
        label="SO product types"
      />
    </SubMenu>
    <SubMenu text="Identity">
      <Menu.ResourceItem name="entity" />
      <Menu.ResourceItem name="party" />
    </SubMenu>
    <SubMenu text="System">
      <Menu.ResourceItem name="event" />
      <Menu.ResourceItem name="notification" />
      <Menu.ResourceItem name="notice" />
    </SubMenu>
  </Menu>
);

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
    <RaLayout menu={MainMenu} appBar={AppBar}>
      <Breadcrumbs />
      {children}
      <Box m={3} />
    </RaLayout>
    <ReactQueryDevtools initialIsOpen={false} />
    <footer
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        backgroundColor: elhubTheme.palette.primary.main,
        textAlign: "center",
      }}
    >
      <form
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <FooterButton href={serverURL} label="Portal" />
        <FooterButton href={docsURL} label="Project documentation" />
        <FooterButton href={apiURL} label="Main API documentation" />
        <FooterButton href={authURL} label="Auth API documentation" />
      </form>
    </footer>
  </>
);

export const App = () => (
  <Admin
    authProvider={authProvider()}
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
