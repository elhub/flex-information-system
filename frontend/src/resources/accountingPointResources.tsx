import { JSX } from "react";
import { Resource } from "react-admin";
import { AccountingPointList } from "../accounting_point/AccountingPointList";
import { AccountingPointShow } from "../accounting_point/show/AccountingPointShow";
import { Permissions } from "../auth/permissions";

export const createAccountingPointResources = (permissions: Permissions) => {
  const resources: JSX.Element[] = [];

  const canReadAP = permissions.allow("accounting_point", "read");
  const canReadAPES = permissions.allow(
    "accounting_point_energy_supplier",
    "read",
  );
  const canReadAPMGA = permissions.allow(
    "accounting_point_metering_grid_area",
    "read",
  );
  const canReadAPBRP = permissions.allow(
    "accounting_point_balance_responsible_party",
    "read",
  );
  const canReadAPEU = permissions.allow("accounting_point_end_user", "read");

  if (canReadAP) {
    resources.push(
      <Resource
        key="accounting_point"
        name="accounting_point"
        list={AccountingPointList}
        show={AccountingPointShow}
        recordRepresentation="business_id"
      />,
    );
  }
  if (canReadAPES)
    resources.push(
      <Resource
        key="accounting_point_energy_supplier"
        name="accounting_point_energy_supplier"
      />,
    );
  if (canReadAPMGA)
    resources.push(
      <Resource
        key="accounting_point_metering_grid_area"
        name="accounting_point_metering_grid_area"
      />,
    );
  if (canReadAPBRP)
    resources.push(
      <Resource
        key="accounting_point_balance_responsible_party"
        name="accounting_point_balance_responsible_party"
      />,
    );
  if (canReadAPEU)
    resources.push(
      <Resource
        key="accounting_point_end_user"
        name="accounting_point_end_user"
      />,
    );

  return resources;
};
