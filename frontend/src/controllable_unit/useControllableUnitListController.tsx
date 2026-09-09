import type { Exporter } from "ra-core";
import {
  defaultExporter,
  useGetIdentity,
  usePermissions,
  useTranslate,
} from "ra-core";
import { zControllableUnit } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { Permissions } from "../auth/permissions";
import type { ControllableUnit } from "../generated-client";

// Controller/logic layer: owns RA (usePermissions, useGetIdentity,
// useTranslate), field metadata, and the exporter. Returns plain data/
// booleans/functions only � no JSX/component instances. It is up to the
// View (ControllableUnitList) to decide which components to render (e.g.
// which action buttons, which filter inputs) from these values.
export const useControllableUnitListController = () => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();
  const canLookup = !!permissions?.allow("controllable_unit", "lookup");
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";

  const fields = getFields(zControllableUnit.shape);

  const accountingPointFilterLabel = translate(
    "field.controllable_unit.accounting_point_id",
  );

  const exporter: Exporter = async (
    records,
    fetchRelatedRecords,
    dataProvider,
    resource,
  ) => {
    const { data } = await dataProvider.getList<ControllableUnit>(
      "controllable_unit",
      {
        filter: { embed: "accounting_point" },
        pagination: { page: 1, perPage: 100000 },
        sort: { field: "id", order: "DESC" },
      },
    );

    const rows = data.map((record) => ({
      id: record.id,
      business_id: record.business_id,
      accounting_point: record.accounting_point?.business_id ?? "",
      name: record.name,
      maximum_active_power: record.maximum_active_power,
      is_small: record.is_small,
      regulation_direction: record.regulation_direction,
      start_date: record.start_date,
      status: record.status,
      additional_information: record.additional_information,
      recorded_by: record.recorded_by,
      recorded_at: record.recorded_at,
    }));

    defaultExporter(rows, fetchRelatedRecords, dataProvider, resource);
  };

  return {
    fields,
    canLookup,
    isFiso,
    accountingPointFilterLabel,
    exporter,
    sort: { field: "id", order: "DESC" as const },
    filter: {
      embed:
        "accounting_point!(bidding_zone, balance_responsible_party(balance_responsible_party))",
    },
  };
};
