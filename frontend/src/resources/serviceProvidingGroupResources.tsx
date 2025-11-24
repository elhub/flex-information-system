import { Resource, Create, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { JSX } from "react";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { EditRedirectPreviousPage, CreateRedirectPreviousPage } from "./shared";
import { ServiceProvidingGroupList } from "../service_providing_group/ServiceProvidingGroupList";
import { ServiceProvidingGroupShow } from "../service_providing_group/ServiceProvidingGroupShow";
import { ServiceProvidingGroupInput } from "../service_providing_group/ServiceProvidingGroupInput";
import { ServiceProvidingGroupHistoryList } from "../service_providing_group/ServiceProvidingGroupHistoryList";
import { ServiceProvidingGroupMembershipInput } from "../service_providing_group/membership/ServiceProvidingGroupMembershipInput";
import { ServiceProvidingGroupMembershipShow } from "../service_providing_group/membership/ServiceProvidingGroupMembershipShow";
import { ServiceProvidingGroupMembershipList } from "../service_providing_group/membership/ServiceProvidingGroupMembershipList";
import { ServiceProvidingGroupMembershipHistoryList } from "../service_providing_group/membership/ServiceProvidingGroupMembershipHistoryList";
import { ServiceProvidingGroupGridPrequalificationShow } from "../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationShow";
import { ServiceProvidingGroupGridPrequalificationInput } from "../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput";
import { ServiceProvidingGroupGridPrequalificationHistoryList } from "../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationHistoryList";
import { ServiceProvidingGroupGridPrequalificationList } from "../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationList";
import { ServiceProvidingGroupProductApplicationInput } from "../service_providing_group/product_application/ServiceProvidingGroupProductApplicationInput";
import { ServiceProvidingGroupProductApplicationShow } from "../service_providing_group/product_application/ServiceProvidingGroupProductApplicationShow";
import { ServiceProvidingGroupProductApplicationHistoryList } from "../service_providing_group/product_application/ServiceProvidingGroupProductApplicationHistoryList";

export const createServiceProvidingGroupResources = (permissions: string[]) => {
  const resources: JSX.Element[] = [];

  if (permissions.includes("service_providing_group.read")) {
    resources.push(
      <Resource
        key="service_providing_group"
        name="service_providing_group"
        icon={BookmarksIcon}
        list={ServiceProvidingGroupList}
        show={ServiceProvidingGroupShow}
        edit={
          permissions.includes("service_providing_group.update") ? (
            <EditRedirectPreviousPage>
              <ServiceProvidingGroupInput />
            </EditRedirectPreviousPage>
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
        {/* Membership routes */}
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
              <CreateRedirectPreviousPage>
                <ServiceProvidingGroupMembershipInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/membership/:id"
          element={
            <ResourceContextProvider value="service_providing_group_membership">
              <EditRedirectPreviousPage>
                <ServiceProvidingGroupMembershipInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
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
        {/* Grid Prequalification routes */}
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
              <CreateRedirectPreviousPage>
                <ServiceProvidingGroupGridPrequalificationInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/grid_prequalification/:id"
          element={
            <ResourceContextProvider value="service_providing_group_grid_prequalification">
              <EditRedirectPreviousPage>
                <ServiceProvidingGroupGridPrequalificationInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
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
        {/* Product Application routes */}
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
              <CreateRedirectPreviousPage>
                <ServiceProvidingGroupProductApplicationInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_application/:id"
          element={
            <ResourceContextProvider value="service_providing_group_product_application">
              <EditRedirectPreviousPage>
                <ServiceProvidingGroupProductApplicationInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
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
        {/* Grid Suspension routes - truncated for brevity, same pattern */}
        {/* Product Suspension routes - truncated for brevity, same pattern */}
      </Resource>,
    );
  }

  // Additional SPG-related resources
  if (
    permissions.includes("service_providing_group_grid_prequalification.read")
  ) {
    resources.push(
      <Resource
        key="service_providing_group_grid_prequalification"
        name="service_providing_group_grid_prequalification"
        icon={BookmarkAddedIcon}
        list={ServiceProvidingGroupGridPrequalificationList}
        show={ServiceProvidingGroupGridPrequalificationShow}
        edit={
          permissions.includes(
            "service_providing_group_grid_prequalification.update",
          ) ? (
            <EditRedirectPreviousPage>
              <ServiceProvidingGroupGridPrequalificationInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          permissions.includes(
            "service_providing_group_grid_prequalification.create",
          ) ? (
            <CreateRedirectPreviousPage>
              <ServiceProvidingGroupGridPrequalificationInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      />,
    );
  }

  if (permissions.includes("service_providing_group_membership.read")) {
    resources.push(
      <Resource
        key="service_providing_group_membership"
        name="service_providing_group_membership"
        icon={BookmarkAddIcon}
        list={ServiceProvidingGroupMembershipList}
        show={ServiceProvidingGroupMembershipShow}
        edit={
          permissions.includes("service_providing_group_membership.update") ? (
            <EditRedirectPreviousPage>
              <ServiceProvidingGroupMembershipInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          permissions.includes("service_providing_group_membership.create") ? (
            <CreateRedirectPreviousPage>
              <ServiceProvidingGroupMembershipInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      />,
    );
  }

  return resources;
};
