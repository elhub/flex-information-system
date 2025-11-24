import { Resource } from "react-admin";
import { JSX } from "react";
import { EditRedirectPreviousPage, CreateRedirectPreviousPage } from "./shared";
import { ServiceProviderProductApplicationList } from "../service_provider_product_application/ServiceProviderProductApplicationList";
import { ServiceProviderProductApplicationShow } from "../service_provider_product_application/ServiceProviderProductApplicationShow";
import { ServiceProviderProductApplicationInput } from "../service_provider_product_application/ServiceProviderProductApplicationInput";
import { ServiceProviderProductSuspensionList } from "../service_provider_product_suspension/ServiceProviderProductSuspensionList";
import { ServiceProviderProductSuspensionShow } from "../service_provider_product_suspension/ServiceProviderProductSuspensionShow";
import { ServiceProviderProductSuspensionInput } from "../service_provider_product_suspension/ServiceProviderProductSuspensionInput";

export const createServiceProviderResources = (permissions: string[]) => {
  const resources: JSX.Element[] = [];

  if (permissions.includes("service_provider_product_application.read")) {
    resources.push(
      <Resource
        key="service_provider_product_application"
        name="service_provider_product_application"
        list={ServiceProviderProductApplicationList}
        show={ServiceProviderProductApplicationShow}
        edit={
          permissions.includes(
            "service_provider_product_application.update",
          ) ? (
            <EditRedirectPreviousPage>
              <ServiceProviderProductApplicationInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          permissions.includes(
            "service_provider_product_application.create",
          ) ? (
            <CreateRedirectPreviousPage>
              <ServiceProviderProductApplicationInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      >
        {/* Routes would go here - truncated for brevity */}
      </Resource>,
    );
  }

  if (permissions.includes("service_provider_product_suspension.read")) {
    resources.push(
      <Resource
        key="service_provider_product_suspension"
        name="service_provider_product_suspension"
        list={ServiceProviderProductSuspensionList}
        show={ServiceProviderProductSuspensionShow}
        edit={
          permissions.includes("service_provider_product_suspension.update") ? (
            <EditRedirectPreviousPage>
              <ServiceProviderProductSuspensionInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          permissions.includes("service_provider_product_suspension.create") ? (
            <CreateRedirectPreviousPage>
              <ServiceProviderProductSuspensionInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      >
        {/* Routes would go here - truncated for brevity */}
      </Resource>,
    );
  }

  return resources;
};
