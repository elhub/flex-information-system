import { Resource, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { JSX } from "react";
import { EditRedirectPreviousPage, CreateRedirectPreviousPage } from "./shared";
import { Permissions } from "../auth/permissions";
import { ServiceProviderProductApplicationList } from "../service_provider_product_application/ServiceProviderProductApplicationList";
import { ServiceProviderProductApplicationShow } from "../service_provider_product_application/ServiceProviderProductApplicationShow";
import { ServiceProviderProductApplicationInput } from "../service_provider_product_application/ServiceProviderProductApplicationInput";
import { ServiceProviderProductApplicationHistoryList } from "../service_provider_product_application/ServiceProviderProductApplicationHistoryList";
import { ServiceProviderProductSuspensionList } from "../service_provider_product_suspension/ServiceProviderProductSuspensionList";
import { ServiceProviderProductSuspensionShow } from "../service_provider_product_suspension/ServiceProviderProductSuspensionShow";
import { ServiceProviderProductSuspensionInput } from "../service_provider_product_suspension/ServiceProviderProductSuspensionInput";
import { ServiceProviderProductSuspensionHistoryList } from "../service_provider_product_suspension/ServiceProviderProductSuspensionHistoryList";

export const createServiceProviderResources = (permissions: Permissions) => {
  const resources: JSX.Element[] = [];

  // Permission checks
  const canReadApplication = permissions.allow(
    "service_provider_product_application",
    "read",
  );
  const canCreateApplication = permissions.allow(
    "service_provider_product_application",
    "create",
  );
  const canUpdateApplication = permissions.allow(
    "service_provider_product_application",
    "update",
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
      </Resource>,
    );
  }

  // Permission checks for service provider product suspension
  const canReadSuspension = permissions.allow(
    "service_provider_product_suspension",
    "read",
  );
  const canCreateSuspension = permissions.allow(
    "service_provider_product_suspension",
    "create",
  );
  const canUpdateSuspension = permissions.allow(
    "service_provider_product_suspension",
    "update",
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
      </Resource>,
    );
  }

  return resources;
};
