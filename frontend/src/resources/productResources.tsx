import { Resource, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { JSX } from "react";
import { EditRedirectPreviousPage, CreateRedirectPreviousPage } from "./shared";
import { Permissions } from "../auth/permissions";
import { displayProductType } from "../product_type/components";
import { ProductTypeList } from "../product_type/ProductTypeList";
import { ProductTypeShow } from "../product_type/ProductTypeShow";
import { SystemOperatorProductTypeList } from "../system_operator_product_type/SystemOperatorProductTypeList";
import { SystemOperatorProductTypeShow } from "../system_operator_product_type/SystemOperatorProductTypeShow";
import { SystemOperatorProductTypeInput } from "../system_operator_product_type/SystemOperatorProductTypeInput";
import { SystemOperatorProductTypeHistoryList } from "../system_operator_product_type/SystemOperatorProductTypeHistoryList";

export const createProductResources = (permissions: Permissions) => {
  const resources: JSX.Element[] = [];

  // Permission checks
  const canReadProductType = permissions.allow("product_type", "read");
  const canReadSOPT = permissions.allow("system_operator_product_type", "read");
  const canCreateSOPT = permissions.allow(
    "system_operator_product_type",
    "create",
  );
  const canUpdateSOPT = permissions.allow(
    "system_operator_product_type",
    "update",
  );

  if (canReadProductType) {
    resources.push(
      <Resource
        key="product_type"
        name="product_type"
        list={ProductTypeList}
        show={ProductTypeShow}
        recordRepresentation={displayProductType}
      />,
    );
  }

  if (canReadSOPT) {
    resources.push(
      <Resource
        key="system_operator_product_type"
        name="system_operator_product_type"
        list={SystemOperatorProductTypeList}
        show={SystemOperatorProductTypeShow}
        edit={
          canUpdateSOPT ? (
            <EditRedirectPreviousPage>
              <SystemOperatorProductTypeInput />
            </EditRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
        create={
          canCreateSOPT ? (
            <CreateRedirectPreviousPage>
              <SystemOperatorProductTypeInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      >
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
      </Resource>,
    );
  }

  return resources;
};
