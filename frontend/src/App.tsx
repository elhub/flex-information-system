import { useState, ReactNode } from "react";
import {
  Admin,
  Resource,
  Create,
  CustomRoutes,
  Edit,
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
} from "react-admin";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Collapse from "@mui/material/Collapse";

import { Route, Navigate } from "react-router-dom";
import { apiURL, serverURL, httpClient, authURL } from "./httpConfig";

import { authProvider, sessionInfoKey } from "./auth";

import { Dashboard } from "./Dashboard";
import { Breadcrumbs } from "./Breadcrumbs";
import { elhubTheme } from "./theme";

import { LoginPage } from "./LoginPage";
import { AssumePartyPage } from "./AssumePartyPage";
import postgrestRestProvider, {
  IDataProviderConfig,
  defaultPrimaryKeys,
  defaultSchema,
} from "@raphiniert/ra-data-postgrest";

import { EntityList } from "./entity/EntityList";
import { EntityShow } from "./entity/EntityShow";

import {
  PartyList,
  PartyShow,
  PartyMembershipShow,
  PartyMembershipInput,
  PartyMembershipHistoryList,
  PartyHistoryList,
  PartyInput,
} from "./party/";

import {
  ControllableUnitList,
  ControllableUnitHistoryList,
  ControllableUnitInput,
  ControllableUnitShow,
  ControllableUnitServiceProviderShow,
  ControllableUnitServiceProviderInput,
  ControllableUnitServiceProviderHistoryList,
} from "./controllable_unit/";

import {
  ServiceProvidingGroupList,
  ServiceProvidingGroupHistoryList,
  ServiceProvidingGroupInput,
  ServiceProvidingGroupShow,
  ServiceProvidingGroupMembershipInput,
  ServiceProvidingGroupMembershipShow,
  ServiceProvidingGroupMembershipList,
  ServiceProvidingGroupMembershipHistoryList,
  ServiceProvidingGroupProductApplicationInput,
  ServiceProvidingGroupProductApplicationShow,
  ServiceProvidingGroupProductApplicationHistoryList,
  ServiceProvidingGroupProductApplicationList,
} from "./service_providing_group";

import { roleNames } from "./roles";
import { TechnicalResourceShow } from "./controllable_unit/technical_resource/TechnicalResourceShow";
import { TechnicalResourceInput } from "./controllable_unit/technical_resource/TechnicalResourceInput";
import { TechnicalResourceHistoryList } from "./controllable_unit/technical_resource/TechnicalResourceHistoryList";
import { ServiceProvidingGroupGridPrequalificationShow } from "./service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationShow";
import { ServiceProvidingGroupGridPrequalificationInput } from "./service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput";
import { ServiceProvidingGroupGridPrequalificationHistoryList } from "./service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationHistoryList";
import { EventList, EventShow } from "./event";
import { NotificationList, NotificationShow } from "./notification";
import { ProductTypeList } from "./product_type/ProductTypeList";
import { ProductTypeShow } from "./product_type/ProductTypeShow";
import { SystemOperatorProductTypeList } from "./system_operator_product_type/SystemOperatorProductTypeList";
import { SystemOperatorProductTypeShow } from "./system_operator_product_type/SystemOperatorProductTypeShow";
import { SystemOperatorProductTypeInput } from "./system_operator_product_type/SystemOperatorProductTypeInput";
import { SystemOperatorProductTypeHistoryList } from "./system_operator_product_type/SystemOperatorProductTypeHistoryList";
import { ServiceProviderProductApplicationList } from "./service_provider_product_application/ServiceProviderProductApplicationList";
import { ServiceProviderProductApplicationShow } from "./service_provider_product_application/ServiceProviderProductApplicationShow";
import { ServiceProviderProductApplicationInput } from "./service_provider_product_application/ServiceProviderProductApplicationInput";
import { ServiceProviderProductApplicationHistoryList } from "./service_provider_product_application/ServiceProviderProductApplicationHistoryList";
import { ServiceProvidingGroupGridPrequalificationList } from "./service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationList";
import { EntityInput } from "./entity/EntityInput";
import { ServiceProviderProductApplicationCommentInput } from "./service_provider_product_application/comment/ServiceProviderProductApplicationCommentInput";
import { ServiceProviderProductApplicationCommentShow } from "./service_provider_product_application/comment/ServiceProviderProductApplicationCommentShow";
import { ServiceProviderProductApplicationCommentHistoryList } from "./service_provider_product_application/comment/ServiceProviderProductApplicationCommentHistoryList";
import { NoticeList } from "./notice/NoticeList";
import { ControllableUnitLookupInput } from "./controllable_unit/lookup/ControllableUnitLookupInput";
import { ControllableUnitLookupResult } from "./controllable_unit/lookup/ControllableUnitLookupResult";
import { EntityClientInput } from "./entity/client/EntityClientInput";
import { EntityClientShow } from "./entity/client/EntityClientShow";

const config: IDataProviderConfig = {
  apiUrl: apiURL,
  httpClient: httpClient,
  defaultListOp: "eq",
  primaryKeys: defaultPrimaryKeys,
  schema: defaultSchema,
};

const dataProvider = postgrestRestProvider(config);

const AssumeParty = () => {
  const redirect = useRedirect();
  const userMenu = useUserMenu();

  return (
    <MenuItem
      onClick={() => {
        userMenu?.onClose();
        redirect("/login/assumeParty");
      }}
    >
      <ListItemIcon>
        <PeopleAltIcon />
      </ListItemIcon>
      <ListItemText>Assume another party</ListItemText>
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
          <AssumeParty />
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

const MainMenu = () => (
  <Menu>
    <Menu.DashboardItem />
    <SubMenu text="Basic resources" defaultOpen>
      <Menu.ResourceItem name="controllable_unit" />
      <Menu.ResourceItem name="service_providing_group" />
      <Menu.ResourceItem name="service_providing_group_membership" />
      <Menu.ResourceItem name="service_providing_group_grid_prequalification" />
    </SubMenu>
    <SubMenu text="Product application" defaultOpen>
      <Menu.ResourceItem name="service_provider_product_application" />
      <Menu.ResourceItem name="service_providing_group_product_application" />
    </SubMenu>
    <SubMenu text="Product type">
      <Menu.ResourceItem name="product_type" />
      <Menu.ResourceItem name="system_operator_product_type" />
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
        <FooterButton
          href={`${serverURL}/docs`}
          label="Project documentation"
        />
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
    {(permissions = []) => (
      <>
        {permissions.includes("entity.read") ? (
          <Resource
            name="entity"
            list={EntityList}
            show={EntityShow}
            edit={
              permissions.includes("entity.update") ? (
                <Edit mutationMode="pessimistic">
                  <EntityInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            recordRepresentation="name"
          >
            {/* client subresource */}
            {/* list is part of ENT show page */}
            <Route
              path=":entity_id/client/:id/show"
              element={
                <ResourceContextProvider value="entity_client">
                  <EntityClientShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":entity_id/client/create"
              element={
                <ResourceContextProvider value="entity_client">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `entity/${record.entity_id}/show`
                    }
                  >
                    <EntityClientInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            <Route
              path=":entity_id/client/:id"
              element={
                <ResourceContextProvider value="entity_client">
                  <Edit
                    mutationMode="pessimistic"
                    redirect={(_: any, _id: any, record: any) =>
                      `entity/${record.entity_id}/show`
                    }
                  >
                    <EntityClientInput />
                  </Edit>
                </ResourceContextProvider>
              }
            />
          </Resource>
        ) : null}
        {permissions.includes("party.read") ? (
          <Resource
            name="party"
            list={PartyList}
            show={PartyShow}
            edit={
              permissions.includes("party.update") ? (
                <Edit mutationMode="pessimistic">
                  <PartyInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes("party.create") ? (
                <Create redirect="list">
                  <PartyInput />
                </Create>
              ) : (
                (null as any)
              )
            }
            recordRepresentation="name"
          >
            {/* party history */}
            <Route path=":party_id/history" element={<PartyHistoryList />} />
            <Route
              path=":party_id/history/:id/show"
              element={
                <ResourceContextProvider value="party_history">
                  <PartyShow />
                </ResourceContextProvider>
              }
            ></Route>
            {/* party membership relation */}
            {/* list is part of PTY show page */}
            <Route
              path=":party_id/membership/:id/show"
              element={
                <ResourceContextProvider value="party_membership">
                  <PartyMembershipShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":party_id/membership/create"
              element={
                <ResourceContextProvider value="party_membership">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `party/${record.party_id}/show`
                    }
                  >
                    <PartyMembershipInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            {/* party membership relation history */}
            <Route
              path=":party_id/membership_history"
              element={<PartyMembershipHistoryList />}
            />
            <Route
              path=":party_id/membership_history/:id/show"
              element={
                <ResourceContextProvider value="party_membership_history">
                  <PartyMembershipShow />
                </ResourceContextProvider>
              }
            />
          </Resource>
        ) : null}
        {permissions.includes("controllable_unit.read") ? (
          <Resource
            name="controllable_unit"
            list={ControllableUnitList}
            show={ControllableUnitShow}
            icon={BookmarkIcon}
            edit={
              permissions.includes("controllable_unit.update") ? (
                <Edit mutationMode="pessimistic">
                  <ControllableUnitInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes("controllable_unit.create") ? (
                <Create redirect="list">
                  <ControllableUnitInput />
                </Create>
              ) : (
                (null as any)
              )
            }
            recordRepresentation="name"
          >
            {/* lookup */}
            <Route path="lookup" element={<ControllableUnitLookupInput />} />
            <Route
              path="lookup/result"
              element={<ControllableUnitLookupResult />}
            />
            {/* controllable unit history */}
            <Route
              path=":controllable_unit_id/history"
              element={<ControllableUnitHistoryList />}
            />
            <Route
              path=":controllable_unit_id/history/:id/show"
              element={
                <ResourceContextProvider value="controllable_unit_history">
                  <ControllableUnitShow />
                </ResourceContextProvider>
              }
            ></Route>
            {/* controllable unit service provider relation */}
            {/* list is part of controllable unit show page */}
            <Route
              path=":controllable_unit_id/service_provider"
              element={<Navigate to="../show" relative="path" replace={true} />}
            />

            <Route
              path=":controllable_unit_id/service_provider/:id/show"
              element={
                <ResourceContextProvider value="controllable_unit_service_provider">
                  <ControllableUnitServiceProviderShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":controllable_unit_id/service_provider/create"
              element={
                <ResourceContextProvider value="controllable_unit_service_provider">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `controllable_unit/${record.controllable_unit_id}/show`
                    }
                  >
                    <ControllableUnitServiceProviderInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            <Route
              path=":controllable_unit_id/service_provider/:id"
              element={
                <ResourceContextProvider value="controllable_unit_service_provider">
                  <Edit
                    mutationMode="pessimistic"
                    redirect={(_: any, _id: any, record: any) =>
                      `controllable_unit/${record.controllable_unit_id}/show`
                    }
                  >
                    <ControllableUnitServiceProviderInput />
                  </Edit>
                </ResourceContextProvider>
              }
            />
            {/* controllable unit service provider relation history */}
            <Route
              path=":controllable_unit_id/service_provider_history"
              element={<ControllableUnitServiceProviderHistoryList />}
            />
            <Route
              path=":controllable_unit_id/service_provider_history/:id/show"
              element={
                <ResourceContextProvider value="controllable_unit_service_provider_history">
                  <ControllableUnitServiceProviderShow />
                </ResourceContextProvider>
              }
            />
            {/* technical resource */}
            {/* list is part of controllable unit show page */}
            <Route
              path=":controllable_unit_id/technical_resource"
              element={<Navigate to="../show" relative="path" replace={true} />}
            />

            <Route
              path=":controllable_unit_id/technical_resource/:id/show"
              element={
                <ResourceContextProvider value="technical_resource">
                  <TechnicalResourceShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":controllable_unit_id/technical_resource/create"
              element={
                <ResourceContextProvider value="technical_resource">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `controllable_unit/${record.controllable_unit_id}/show`
                    }
                  >
                    <TechnicalResourceInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            <Route
              path=":controllable_unit_id/technical_resource/:id"
              element={
                <ResourceContextProvider value="technical_resource">
                  <Edit
                    mutationMode="pessimistic"
                    redirect={(_: any, _id: any, record: any) =>
                      `controllable_unit/${record.controllable_unit_id}/show`
                    }
                  >
                    <TechnicalResourceInput />
                  </Edit>
                </ResourceContextProvider>
              }
            />
            {/* technical resource history */}
            <Route
              path=":controllable_unit_id/technical_resource_history"
              element={<TechnicalResourceHistoryList />}
            />
            <Route
              path=":controllable_unit_id/technical_resource_history/:id/show"
              element={
                <ResourceContextProvider value="technical_resource_history">
                  <TechnicalResourceShow />
                </ResourceContextProvider>
              }
            />
          </Resource>
        ) : null}
        {permissions.includes("controllable_unit_service_provider.read") ? (
          <Resource
            name="controllable_unit_service_provider"
            create={
              permissions.includes(
                "controllable_unit_service_provider.create",
              ) ? (
                <Create redirect={() => `controllable_unit`}>
                  <ControllableUnitServiceProviderInput />
                </Create>
              ) : (
                (null as any)
              )
            }
          />
        ) : null}
        {permissions.includes("service_providing_group.read") ? (
          <Resource
            name="service_providing_group"
            icon={BookmarksIcon}
            list={ServiceProvidingGroupList}
            show={ServiceProvidingGroupShow}
            edit={
              permissions.includes("service_providing_group.update") ? (
                <Edit mutationMode="pessimistic">
                  <ServiceProvidingGroupInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes("service_providing_group.create") ? (
                <Create redirect="list">
                  <ServiceProvidingGroupInput />
                </Create>
              ) : (
                (null as any)
              )
            }
            recordRepresentation="name"
          >
            {/* service providing group history */}
            <Route
              path=":service_providing_group_id/history"
              element={<ServiceProvidingGroupHistoryList />}
            />
            <Route
              path=":service_providing_group_id/history/:id/show"
              element={
                <ResourceContextProvider value="service_providing_group_history">
                  <ServiceProvidingGroupShow />
                </ResourceContextProvider>
              }
            />
            {/* service providing group membership relation */}
            {/* list is also part of SPG show page */}
            <Route
              path=":service_providing_group_id/membership/:id/show"
              element={
                <ResourceContextProvider value="service_providing_group_membership">
                  <ServiceProvidingGroupMembershipShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_providing_group_id/membership/create"
              element={
                <ResourceContextProvider value="service_providing_group_membership">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `service_providing_group/${record.service_providing_group_id}/show`
                    }
                  >
                    <ServiceProvidingGroupMembershipInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_providing_group_id/membership/:id"
              element={
                <ResourceContextProvider value="service_providing_group_membership">
                  <Edit
                    mutationMode="pessimistic"
                    redirect={(_: any, _id: any, record: any) =>
                      `service_providing_group/${record.service_providing_group_id}/show`
                    }
                  >
                    <ServiceProvidingGroupMembershipInput />
                  </Edit>
                </ResourceContextProvider>
              }
            />
            {/* service providing group membership relation history */}
            <Route
              path=":service_providing_group_id/membership_history"
              element={<ServiceProvidingGroupMembershipHistoryList />}
            />
            <Route
              path=":service_providing_group_id/membership_history/:id/show"
              element={
                <ResourceContextProvider value="service_providing_group_membership_history">
                  <ServiceProvidingGroupMembershipShow />
                </ResourceContextProvider>
              }
            />
            {/* service providing group grid prequalification subresource */}
            {/* list is part of SPG show page */}
            <Route
              path=":service_providing_group_id/grid_prequalification/:id/show"
              element={
                <ResourceContextProvider value="service_providing_group_grid_prequalification">
                  <ServiceProvidingGroupGridPrequalificationShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_providing_group_id/grid_prequalification/create"
              element={
                <ResourceContextProvider value="service_providing_group_grid_prequalification">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `service_providing_group/${record.service_providing_group_id}/show`
                    }
                  >
                    <ServiceProvidingGroupGridPrequalificationInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_providing_group_id/grid_prequalification/:id"
              element={
                <ResourceContextProvider value="service_providing_group_grid_prequalification">
                  <Edit
                    mutationMode="pessimistic"
                    redirect={(_: any, _id: any, record: any) =>
                      `service_providing_group/${record.service_providing_group_id}/show`
                    }
                  >
                    <ServiceProvidingGroupGridPrequalificationInput />
                  </Edit>
                </ResourceContextProvider>
              }
            />
            {/* service providing group grid prequalification history */}
            <Route
              path=":service_providing_group_id/grid_prequalification_history"
              element={<ServiceProvidingGroupGridPrequalificationHistoryList />}
            />
            <Route
              path=":service_providing_group_id/grid_prequalification_history/:id/show"
              element={
                <ResourceContextProvider value="service_providing_group_grid_prequalification_history">
                  <ServiceProvidingGroupGridPrequalificationShow />
                </ResourceContextProvider>
              }
            />
            {/* service providing group product application relation */}
            {/* list is also part of SPG show page */}
            <Route
              path=":service_providing_group_id/product_application/:id/show"
              element={
                <ResourceContextProvider value="service_providing_group_product_application">
                  <ServiceProvidingGroupProductApplicationShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_providing_group_id/product_application/create"
              element={
                <ResourceContextProvider value="service_providing_group_product_application">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `service_providing_group/${record.service_providing_group_id}/show`
                    }
                  >
                    <ServiceProvidingGroupProductApplicationInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_providing_group_id/product_application/:id"
              element={
                <ResourceContextProvider value="service_providing_group_product_application">
                  <Edit
                    mutationMode="pessimistic"
                    redirect={(_: any, _id: any, record: any) =>
                      `service_providing_group/${record.service_providing_group_id}/show`
                    }
                  >
                    <ServiceProvidingGroupProductApplicationInput />
                  </Edit>
                </ResourceContextProvider>
              }
            />
            {/* service providing group product application relation history */}
            <Route
              path=":service_providing_group_id/product_application_history"
              element={<ServiceProvidingGroupProductApplicationHistoryList />}
            />
            <Route
              path=":service_providing_group_id/product_application_history/:id/show"
              element={
                <ResourceContextProvider value="service_providing_group_product_application_history">
                  <ServiceProvidingGroupProductApplicationShow />
                </ResourceContextProvider>
              }
            />
          </Resource>
        ) : null}
        {permissions.includes(
          "service_providing_group_grid_prequalification.read",
        ) ? (
          <Resource
            name="service_providing_group_grid_prequalification"
            icon={BookmarkAddedIcon}
            list={ServiceProvidingGroupGridPrequalificationList}
            show={ServiceProvidingGroupGridPrequalificationShow}
            edit={
              permissions.includes(
                "service_providing_group_grid_prequalification.update",
              ) ? (
                <Edit mutationMode="pessimistic">
                  <ServiceProvidingGroupGridPrequalificationInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes(
                "service_providing_group_grid_prequalification.create",
              ) ? (
                <Create redirect="list">
                  <ServiceProvidingGroupGridPrequalificationInput />
                </Create>
              ) : (
                (null as any)
              )
            }
          />
        ) : null}
        {permissions.includes("service_providing_group_membership.read") ? (
          <Resource
            name="service_providing_group_membership"
            icon={BookmarkAddIcon}
            list={ServiceProvidingGroupMembershipList}
            show={ServiceProvidingGroupMembershipShow}
            edit={
              permissions.includes(
                "service_providing_group_membership.update",
              ) ? (
                <Edit mutationMode="pessimistic">
                  <ServiceProvidingGroupMembershipInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes(
                "service_providing_group_membership.create",
              ) ? (
                <Create redirect="list">
                  <ServiceProvidingGroupMembershipInput />
                </Create>
              ) : (
                (null as any)
              )
            }
          />
        ) : null}
        {permissions.includes(
          "service_providing_group_product_application.read",
        ) ? (
          <Resource
            name="service_providing_group_product_application"
            list={ServiceProvidingGroupProductApplicationList}
            show={ServiceProvidingGroupProductApplicationShow}
            edit={
              permissions.includes(
                "service_providing_group_product_application.update",
              ) ? (
                <Edit mutationMode="pessimistic">
                  <ServiceProvidingGroupProductApplicationInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes(
                "service_providing_group_product_application.create",
              ) ? (
                <Create redirect="list">
                  <ServiceProvidingGroupProductApplicationInput />
                </Create>
              ) : (
                (null as any)
              )
            }
          />
        ) : null}
        {permissions.includes("service_provider_product_application.read") ? (
          <Resource
            name="service_provider_product_application"
            list={ServiceProviderProductApplicationList}
            show={ServiceProviderProductApplicationShow}
            edit={
              permissions.includes(
                "service_provider_product_application.update",
              ) ? (
                <Edit mutationMode="pessimistic">
                  <ServiceProviderProductApplicationInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes(
                "service_provider_product_application.create",
              ) ? (
                <Create redirect="list">
                  <ServiceProviderProductApplicationInput />
                </Create>
              ) : (
                (null as any)
              )
            }
          >
            {/* service_provider_product_application history */}
            <Route
              path=":service_provider_product_application_id/history"
              element={<ServiceProviderProductApplicationHistoryList />}
            />
            <Route
              path=":service_provider_product_application_id/history/:id/show"
              element={
                <ResourceContextProvider value="service_provider_product_application_history">
                  <ServiceProviderProductApplicationShow />
                </ResourceContextProvider>
              }
            />
            {/* service provider product application comments */}
            {/* list is part of SPG show page */}
            <Route
              path=":service_provider_product_application_id/comment/:id/show"
              element={
                <ResourceContextProvider value="service_provider_product_application_comment">
                  <ServiceProviderProductApplicationCommentShow />
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_provider_product_application_id/comment/create"
              element={
                <ResourceContextProvider value="service_provider_product_application_comment">
                  <Create
                    redirect={(_: any, _id: any, record: any) =>
                      `service_provider_product_application/${record.service_provider_product_application_id}/show`
                    }
                  >
                    <ServiceProviderProductApplicationCommentInput />
                  </Create>
                </ResourceContextProvider>
              }
            />
            <Route
              path=":service_provider_product_application_id/comment/:id"
              element={
                <ResourceContextProvider value="service_provider_product_application_comment">
                  <Edit
                    mutationMode="pessimistic"
                    redirect={(_: any, _id: any, record: any) =>
                      `service_provider_product_application/${record.service_provider_product_application_id}/show`
                    }
                  >
                    <ServiceProviderProductApplicationCommentInput />
                  </Edit>
                </ResourceContextProvider>
              }
            />
            {/* service provider product application comment history */}
            <Route
              path=":service_provider_product_application_id/comment_history"
              element={<ServiceProviderProductApplicationCommentHistoryList />}
            />
            <Route
              path=":service_provider_product_application_id/comment_history/:id/show"
              element={
                <ResourceContextProvider value="service_provider_product_application_comment_history">
                  <ServiceProviderProductApplicationCommentShow />
                </ResourceContextProvider>
              }
            />
          </Resource>
        ) : null}
        {permissions.includes("product_type.read") ? (
          <Resource
            name="product_type"
            list={ProductTypeList}
            show={ProductTypeShow}
          />
        ) : null}
        {permissions.includes("system_operator_product_type.read") ? (
          <Resource
            name="system_operator_product_type"
            list={SystemOperatorProductTypeList}
            show={SystemOperatorProductTypeShow}
            edit={
              permissions.includes("system_operator_product_type.update") ? (
                <Edit mutationMode="pessimistic">
                  <SystemOperatorProductTypeInput />
                </Edit>
              ) : (
                (null as any)
              )
            }
            create={
              permissions.includes("system_operator_product_type.create") ? (
                <Create redirect="list">
                  <SystemOperatorProductTypeInput />
                </Create>
              ) : (
                (null as any)
              )
            }
          >
            {/* system operator product type history */}
            <Route
              path=":system_operator_product_type_id/history"
              element={<SystemOperatorProductTypeHistoryList />}
            />
            <Route
              path=":system_operator_product_type_id/history/:id/show"
              element={
                <ResourceContextProvider value="system_operator_product_type_history">
                  <SystemOperatorProductTypeShow />
                </ResourceContextProvider>
              }
            />
          </Resource>
        ) : null}
        {permissions.includes("event.read") ? (
          <Resource name="event" list={EventList} show={EventShow} />
        ) : null}
        {permissions.includes("notification.read") ? (
          <Resource
            name="notification"
            list={NotificationList}
            show={NotificationShow}
          />
        ) : null}
        {permissions.includes("notice.read") ? (
          <Resource name="notice" list={NoticeList} />
        ) : null}
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
      </>
    )}
  </Admin>
);
