import { Link as RouterLink } from "react-router-dom";
import {
  defaultExporter,
  useGetIdentity,
  usePermissions,
  useTranslate,
} from "ra-core";
import type { DataProvider } from "ra-core";
import { IconDownload, IconPlus } from "@elhub/ds-icons";
import { ResourceListLayout } from "../components/list/ResourceListLayout";
import type { ListColumn, ListFilterDef } from "../components/list/types";
import { StatusBadge } from "../components/StatusBadge";
import { BodyText, Button, Link, Tooltip } from "../components/ui";
import { Permissions } from "../auth/permissions";
import { usePartyOptions } from "../hooks/partyOptions";
import { tooltips } from "../tooltip/tooltips";
import { toDateString, findCurrentlyValidRecord } from "../util";
import type { ControllableUnit } from "../generated-client";
import { cuStatusVariantMap } from "./controllableUnitStatus";
import { RegulationDirectionIcon } from "./RegulationDirectionField";
import {
  BRP_FILTER_SOURCE,
  useControllableUnitList,
} from "./useControllableUnitList";

const Dash = () => <BodyText size="small">-</BodyText>;

export const ControllableUnitList = () => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();
  const { list, fetchAllForExport } = useControllableUnitList();
  const systemOperators = usePartyOptions("system_operator");
  const balanceResponsibleParties = usePartyOptions(
    "balance_responsible_party",
  );

  const canLookup = permissions?.allow("controllable_unit", "lookup");
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";
  const canFilterOnBrp = [
    "flex_balance_responsible_party",
    "flex_flexibility_information_system_operator",
    "flex_system_operator",
    "flex_service_provider",
  ].includes(identity?.role);

  const filters: ListFilterDef[] = [
    {
      type: "text",
      source: "name@ilike",
      label: translate("field.controllable_unit.name"),
    },
    {
      type: "text",
      source: "accounting_point.business_id@ilike",
      label: translate("field.controllable_unit.accounting_point_id"),
    },
    {
      type: "multiselect",
      source: "accounting_point.system_operator_id@in",
      label: translate("field.accounting_point.system_operator_id"),
      options: systemOperators.data ?? [],
      isLoading: systemOperators.isLoading,
    },
    ...(canFilterOnBrp
      ? [
          {
            type: "multiselect" as const,
            source: BRP_FILTER_SOURCE,
            label: translate(
              "field.accounting_point_balance_responsible_party.balance_responsible_party_id",
            ),
            options: balanceResponsibleParties.data ?? [],
            isLoading: balanceResponsibleParties.isLoading,
          },
        ]
      : []),
    {
      type: "singleselect",
      source: "is_small",
      label: translate("field.controllable_unit.is_small"),
      tooltip: tooltips["controllable_unit.is_small"],
      options: [
        {
          value: "true",
          label: translate("text.controllable_unit.is_small.true.label"),
        },
        {
          value: "false",
          label: translate("text.controllable_unit.is_small.false.label"),
        },
      ],
    },
    {
      type: "multiselect",
      source: "status@in",
      label: translate("field.controllable_unit.status"),
      options: Object.keys(cuStatusVariantMap).map((value) => ({
        value,
        label: translate(`enum.controllable_unit.status.${value}`),
      })),
    },
  ];

  const columns: ListColumn<ControllableUnit>[] = [
    {
      header: translate("field.controllable_unit.id"),
      render: (cu) => <BodyText size="small">{cu.id}</BodyText>,
    },
    {
      header: translate("field.controllable_unit.name"),
      sortField: "name",
      render: (cu) => (
        <BodyText size="small" weight="semibold">
          {cu.name}
        </BodyText>
      ),
    },
    {
      header: translate("field.controllable_unit.start_date"),
      sortField: "start_date",
      sortType: "date",
      render: (cu) =>
        cu.start_date ? (
          <BodyText size="small">{toDateString(cu.start_date)}</BodyText>
        ) : null,
    },
    {
      header: translate("field.controllable_unit.is_small"),
      render: (cu) => {
        if (cu.is_small == null) return null;
        const key = cu.is_small
          ? "controllable_unit.is_small.true"
          : "controllable_unit.is_small.false";
        return (
          <Tooltip content={translate(`text.${key}`)}>
            <span>
              <BodyText size="small">{translate(`text.${key}.label`)}</BodyText>
            </span>
          </Tooltip>
        );
      },
    },
    {
      header: translate("field.controllable_unit.accounting_point_id"),
      render: (cu) =>
        cu.accounting_point ? (
          <Link
            as={RouterLink}
            to={`/accounting_point/${cu.accounting_point.id}/show`}
          >
            {cu.accounting_point.business_id}
          </Link>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate("field.accounting_point_bidding_zone.bidding_zone"),
      render: (cu) => {
        const zone = findCurrentlyValidRecord(
          cu.accounting_point?.bidding_zone ?? undefined,
        )?.bidding_zone;
        return zone ? (
          <BodyText size="small">
            {translate(
              `enum.accounting_point_bidding_zone.bidding_zone.${zone}`,
            )}
          </BodyText>
        ) : (
          <Dash />
        );
      },
    },
    {
      header: translate("field.accounting_point.system_operator_id"),
      render: (cu) =>
        cu.accounting_point?.system_operator ? (
          <BodyText size="small">
            {cu.accounting_point.system_operator.name}
          </BodyText>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate(
        "field.accounting_point_balance_responsible_party.balance_responsible_party_id",
      ),
      render: (cu) => {
        const brp = findCurrentlyValidRecord(
          cu.accounting_point?.balance_responsible_party ?? undefined,
        )?.balance_responsible_party;
        return brp ? <BodyText size="small">{brp.name}</BodyText> : <Dash />;
      },
    },
    {
      header: translate("field.controllable_unit.status"),
      sortField: "status",
      render: (cu) => {
        const variant = cuStatusVariantMap[cu.status];
        return variant ? (
          <StatusBadge
            status={variant.status}
            icon={variant.icon}
            label={translate(`enum.controllable_unit.status.${cu.status}`)}
          />
        ) : null;
      },
    },
    {
      header: translate("field.controllable_unit.regulation_direction"),
      render: (cu) =>
        cu.regulation_direction ? (
          <RegulationDirectionIcon value={cu.regulation_direction} />
        ) : null,
    },
  ];

  const exportCsv = async () => {
    const data = await fetchAllForExport();
    defaultExporter(
      data.map((cu) => ({
        id: cu.id,
        business_id: cu.business_id,
        accounting_point: cu.accounting_point?.business_id ?? "",
        name: cu.name,
        maximum_active_power: cu.maximum_active_power,
        is_small: cu.is_small,
        regulation_direction: cu.regulation_direction,
        start_date: cu.start_date,
        status: cu.status,
        additional_information: cu.additional_information,
        recorded_by: cu.recorded_by,
        recorded_at: cu.recorded_at,
      })),
      // defaultExporter only uses the data and the resource name
      async () => ({}),
      {} as DataProvider,
      "controllable_unit",
    );
  };

  const actions = (
    <>
      {canLookup && (
        <Button
          as={RouterLink}
          icon={IconPlus}
          to="/controllable_unit/lookup"
          variant="primary"
        >
          Create
        </Button>
      )}
      {isFiso && (
        <Button
          as={RouterLink}
          icon={IconPlus}
          to="/controllable_unit/create"
          variant="secondary"
        >
          Create manually
        </Button>
      )}
      <Button variant="invisible" onClick={exportCsv} icon={IconDownload}>
        Export
      </Button>
    </>
  );

  return (
    <ResourceListLayout
      title="Controllable units"
      list={list}
      columns={columns}
      filters={filters}
      actions={actions}
      rowLink={(cu) => `/controllable_unit/${cu.id}/show`}
    />
  );
};
