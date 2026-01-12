import { JSX } from "react";
import { Resource } from "react-admin";
import { AccountingPointList } from "../accounting_point/AccountingPointList";
import { AccountingPointShow } from "../accounting_point/AccountingPointShow";

export const createAccountingPointResources = () => {
  const resources: JSX.Element[] = [];

  resources.push(
    <Resource
      key="accounting_point"
      name="accounting_point"
      list={AccountingPointList}
      show={AccountingPointShow}
      recordRepresentation="business_id"
    />,
    <Resource
      key="accounting_point_energy_supplier"
      name="accounting_point_energy_supplier"
    />,
    <Resource
      key="accounting_point_metering_grid_area"
      name="accounting_point_metering_grid_area"
    />,
    <Resource
      key="accounting_point_balance_responsible_party"
      name="accounting_point_balance_responsible_party"
    />,
    <Resource
      key="accounting_point_end_user"
      name="accounting_point_end_user"
    />,
  );

  return resources;
};
