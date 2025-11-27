import { Resource, Create, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { JSX } from "react";
import { EditRedirectPreviousPage, CreateRedirectPreviousPage } from "./shared";
import { ServiceProviderProductApplicationList } from "../service_provider_product_application/ServiceProviderProductApplicationList";
import { ServiceProviderProductApplicationShow } from "../service_provider_product_application/ServiceProviderProductApplicationShow";
import { ServiceProviderProductApplicationInput } from "../service_provider_product_application/ServiceProviderProductApplicationInput";
import { ServiceProviderProductApplicationHistoryList } from "../service_provider_product_application/ServiceProviderProductApplicationHistoryList";
import { ServiceProviderProductSuspensionList } from "../service_provider_product_suspension/ServiceProviderProductSuspensionList";
import { ServiceProviderProductSuspensionShow } from "../service_provider_product_suspension/ServiceProviderProductSuspensionShow";
import { ServiceProviderProductSuspensionInput } from "../service_provider_product_suspension/ServiceProviderProductSuspensionInput";
import { ServiceProviderProductSuspensionHistoryList } from "../service_provider_product_suspension/ServiceProviderProductSuspensionHistoryList";
import {
  CommentShow,
  CommentInput,
  CommentHistoryList,
} from "../components/comments";

export const createServiceProviderResources = (permissions: string[]) => {
  const resources: JSX.Element[] = [];

  // Permission checks
  const canReadApplication = permissions.includes(
    "service_provider_product_application.read",
  );
  const canCreateApplication = permissions.includes(
    "service_provider_product_application.create",
  );
  const canUpdateApplication = permissions.includes(
    "service_provider_product_application.update",
  );

  if (canReadApplication) {
    resources.push(
      <Resource
        key="service_provider_product_application"
        name="service_provider_product_application"
        list={ServiceProviderProductApplicationList}
        show={ServiceProviderProductApplicationShow}
        edit={
          canUpdateApplication ? (
            <EditRedirectPreviousPage>
              <ServiceProviderProductApplicationInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          canCreateApplication ? (
            <CreateRedirectPreviousPage>
              <ServiceProviderProductApplicationInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      >
        {/* history */}
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
        {/* comments */}
        <Route
          path=":service_provider_product_application_id/comment/create"
          element={
            <ResourceContextProvider value="service_provider_product_application_comment">
              <Create
                redirect={(_: any, _id: any, record: any) =>
                  `service_provider_product_application/${record.service_provider_product_application_id}/show`
                }
              >
                <CommentInput />
              </Create>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_provider_product_application_id/comment/:id"
          element={
            <ResourceContextProvider value="service_provider_product_application_comment">
              <EditRedirectPreviousPage>
                <CommentInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_provider_product_application_id/comment/:id/show"
          element={
            <ResourceContextProvider value="service_provider_product_application_comment">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        {/* comment history */}
        <Route
          path=":service_provider_product_application_id/comment_history"
          element={<CommentHistoryList />}
        />
        <Route
          path=":service_provider_product_application_id/comment_history/:id/show"
          element={
            <ResourceContextProvider value="service_provider_product_application_comment_history">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
      </Resource>,
    );
  }

  // Permission checks for service provider product suspension
  const canReadSuspension = permissions.includes(
    "service_provider_product_suspension.read",
  );
  const canCreateSuspension = permissions.includes(
    "service_provider_product_suspension.create",
  );
  const canUpdateSuspension = permissions.includes(
    "service_provider_product_suspension.update",
  );

  if (canReadSuspension) {
    resources.push(
      <Resource
        key="service_provider_product_suspension"
        name="service_provider_product_suspension"
        list={ServiceProviderProductSuspensionList}
        show={ServiceProviderProductSuspensionShow}
        edit={
          canUpdateSuspension ? (
            <EditRedirectPreviousPage>
              <ServiceProviderProductSuspensionInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          canCreateSuspension ? (
            <CreateRedirectPreviousPage>
              <ServiceProviderProductSuspensionInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      >
        {/* history */}
        <Route
          path=":service_provider_product_suspension_id/history"
          element={<ServiceProviderProductSuspensionHistoryList />}
        />
        <Route
          path=":service_provider_product_suspension_id/history/:id/show"
          element={
            <ResourceContextProvider value="service_provider_product_suspension_history">
              <ServiceProviderProductSuspensionShow />
            </ResourceContextProvider>
          }
        />
        {/* comments */}
        <Route
          path=":service_provider_product_suspension_id/comment/create"
          element={
            <ResourceContextProvider value="service_provider_product_suspension_comment">
              <Create
                redirect={(_: any, _id: any, record: any) =>
                  `service_provider_product_suspension/${record.service_provider_product_suspension_id}/show`
                }
              >
                <CommentInput />
              </Create>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_provider_product_suspension_id/comment/:id"
          element={
            <ResourceContextProvider value="service_provider_product_suspension_comment">
              <EditRedirectPreviousPage>
                <CommentInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":service_provider_product_suspension_id/comment/:id/show"
          element={
            <ResourceContextProvider value="service_provider_product_suspension_comment">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        {/* comment history */}
        <Route
          path=":service_provider_product_suspension_id/comment_history"
          element={<CommentHistoryList />}
        />
        <Route
          path=":service_provider_product_suspension_id/comment_history/:id/show"
          element={
            <ResourceContextProvider value="service_provider_product_suspension_comment_history">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
      </Resource>,
    );
  }

  return resources;
};
