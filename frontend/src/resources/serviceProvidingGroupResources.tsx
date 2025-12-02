import { Resource, Create, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { JSX } from "react";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { EditRedirectPreviousPage, CreateRedirectPreviousPage } from "./shared";
import { Permissions } from "../auth/permissions";
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
import { ServiceProvidingGroupProductSuspensionInput } from "../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionInput";
import { ServiceProvidingGroupProductSuspensionShow } from "../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionShow";
import { ServiceProvidingGroupProductSuspensionHistoryList } from "../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionHistoryList";
import {
  ServiceProvidingGroupGridSuspensionHistoryList,
  ServiceProvidingGroupGridSuspensionInput,
  ServiceProvidingGroupGridSuspensionShow,
} from "../service_providing_group";
import {
  CommentShow,
  CommentInput,
  CommentHistoryList,
} from "../components/comments";

export const createServiceProvidingGroupResources = (
  permissions: Permissions,
) => {
  const resources: JSX.Element[] = [];

  // Permission checks
  const canRead = permissions.allow("service_providing_group", "read");
  const canCreate = permissions.allow("service_providing_group", "create");
  const canUpdate = permissions.allow("service_providing_group", "update");

  if (canRead) {
    resources.push(
      <Resource
        key="service_providing_group"
        name="service_providing_group"
        icon={BookmarksIcon}
        list={ServiceProvidingGroupList}
        show={ServiceProvidingGroupShow}
        edit={
          canUpdate ? (
            <EditRedirectPreviousPage>
              <ServiceProvidingGroupInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          canCreate ? (
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
        {/* service providing group grid prequalification comments */}
        {/* list is part of SPG grid prequalification show page */}
        <Route
          path=":service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_grid_prequalification_comment">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment/create"
          element={
            <ResourceContextProvider value="service_providing_group_grid_prequalification_comment">
              <CreateRedirectPreviousPage>
                <CommentInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment/:id"
          element={
            <ResourceContextProvider value="service_providing_group_grid_prequalification_comment">
              <EditRedirectPreviousPage>
                <CommentInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        {/* service providing group grid prequalification comment history */}
        <Route
          path=":service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment_history"
          element={<CommentHistoryList />}
        />
        <Route
          path=":service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment_history/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_grid_prequalification_comment_history">
              <CommentShow />
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
        {/* service providing group grid suspension */}
        {/* list is also part of SPG show page */}
        <Route
          path=":service_providing_group_id/grid_suspension/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension">
              <ServiceProvidingGroupGridSuspensionShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/grid_suspension/create"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension">
              <CreateRedirectPreviousPage>
                <ServiceProvidingGroupGridSuspensionInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        {/* service providing group grid suspension relation history */}
        <Route
          path=":service_providing_group_id/grid_suspension_history"
          element={<ServiceProvidingGroupGridSuspensionHistoryList />}
        />
        <Route
          path=":service_providing_group_id/grid_suspension_history/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension_history">
              <ServiceProvidingGroupGridSuspensionShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/grid_suspension/:id"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension">
              <EditRedirectPreviousPage>
                <ServiceProvidingGroupGridSuspensionInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        {/* service providing group grid suspension comments */}
        {/* list is part of SPG grid suspension show page */}
        <Route
          path=":service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension_comment">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment/create"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension_comment">
              <CreateRedirectPreviousPage>
                <CommentInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment/:id"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension_comment">
              <EditRedirectPreviousPage>
                <CommentInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        {/* service provider product suspension comment history */}
        <Route
          path=":service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment_history"
          element={<CommentHistoryList />}
        />
        <Route
          path=":service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment_history/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_grid_suspension_comment_history">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        {/* Product Suspension routes */}
        <Route
          path=":service_providing_group_id/product_suspension/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension">
              <ServiceProvidingGroupProductSuspensionShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_suspension/create"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension">
              <CreateRedirectPreviousPage>
                <ServiceProvidingGroupProductSuspensionInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_suspension/:id"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension">
              <EditRedirectPreviousPage>
                <ServiceProvidingGroupProductSuspensionInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_suspension_history"
          element={<ServiceProvidingGroupProductSuspensionHistoryList />}
        />
        <Route
          path=":service_providing_group_id/product_suspension_history/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension_history">
              <ServiceProvidingGroupProductSuspensionShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension_comment">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment/create"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension_comment">
              <CreateRedirectPreviousPage>
                <CommentInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment/:id"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension_comment">
              <EditRedirectPreviousPage>
                <CommentInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment_history"
          element={<CommentHistoryList />}
        />
        <Route
          path=":service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment_history/:id/show"
          element={
            <ResourceContextProvider value="service_providing_group_product_suspension_comment_history">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
      </Resource>,
    );
  }

  // Additional SPG-related resources permission checks
  const canReadGridPrequalification = permissions.allow(
    "service_providing_group_grid_prequalification",
    "read",
  );
  const canCreateGridPrequalification = permissions.allow(
    "service_providing_group_grid_prequalification",
    "create",
  );
  const canUpdateGridPrequalification = permissions.allow(
    "service_providing_group_grid_prequalification",
    "update",
  );

  if (canReadGridPrequalification) {
    resources.push(
      <Resource
        key="service_providing_group_grid_prequalification"
        name="service_providing_group_grid_prequalification"
        icon={BookmarkAddedIcon}
        list={ServiceProvidingGroupGridPrequalificationList}
        show={ServiceProvidingGroupGridPrequalificationShow}
        edit={
          canUpdateGridPrequalification ? (
            <EditRedirectPreviousPage>
              <ServiceProvidingGroupGridPrequalificationInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          canCreateGridPrequalification ? (
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

  const canReadMembership = permissions.allow(
    "service_providing_group_membership",
    "read",
  );
  const canCreateMembership = permissions.allow(
    "service_providing_group_membership",
    "create",
  );
  const canUpdateMembership = permissions.allow(
    "service_providing_group_membership",
    "update",
  );

  if (canReadMembership) {
    resources.push(
      <Resource
        key="service_providing_group_membership"
        name="service_providing_group_membership"
        icon={BookmarkAddIcon}
        list={ServiceProvidingGroupMembershipList}
        show={ServiceProvidingGroupMembershipShow}
        edit={
          canUpdateMembership ? (
            <EditRedirectPreviousPage>
              <ServiceProvidingGroupMembershipInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          canCreateMembership ? (
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
