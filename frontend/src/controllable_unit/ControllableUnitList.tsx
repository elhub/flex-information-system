import { Link as RouterLink } from "react-router-dom";
import type { Exporter } from "ra-core";
import {
  defaultExporter,
  useGetIdentity,
  usePermissions,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { ExportButton } from "react-admin";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  StatusBadgeField,
  TextField,
} from "../components/EDS-ra/fields";
import { cuStatusVariantMap } from "./controllableUnitStatus";
import { RegulationDirectionField } from "./RegulationDirectionField";
import { EnumArrayInput, TextInput } from "../components/EDS-ra/inputs";
import { BodyText, Button, Tooltip } from "../components/ui";
import { Permissions } from "../auth/permissions";
import { zControllableUnit } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { IconPlus } from "@elhub/ds-icons";
import { findCurrentlyValidRecord } from "../util";
import type {
  AccountingPointBalanceResponsibleParty,
  AccountingPointBiddingZone,
  ControllableUnit,
} from "../generated-client";

import { AccountingPointLinkField } from "../accounting_point/AccountingPointLinkField";

const CULookupButton = () => (
  <Button
    as={RouterLink}
    icon={IconPlus}
    to="/controllable_unit/lookup"
    variant="invisible"
  >
    Create
  </Button>
);

const CreateButton = () => (
  <Button
    as={RouterLink}
    icon={IconPlus}
    to="/controllable_unit/create"
    variant="invisible"
  >
    Create manually
  </Button>
);

const BiddingZoneField = ({ source: _source }: { source: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();

  const current = findCurrentlyValidRecord(
    record?.accounting_point?.bidding_zone as
      AccountingPointBiddingZone[] | undefined,
  );

  if (!current?.bidding_zone) return <BodyText size="small">-</BodyText>;
  return (
    <BodyText size="small">
      {translate(
        `enum.accounting_point_bidding_zone.bidding_zone.${current.bidding_zone}`,
      )}
    </BodyText>
  );
};

// custom component resolving the BRP through the accounting point
const BalanceResponsiblePartyField = ({
  source: _source,
}: {
  source: string;
}) => {
  const record = useRecordContext();
  const current = findCurrentlyValidRecord(
    record?.accounting_point?.balance_responsible_party as
      AccountingPointBalanceResponsibleParty[] | undefined,
  );

  const party = current?.balance_responsible_party;

  if (!party) return <BodyText size="small">-</BodyText>;
  return <BodyText size="small">{party.name}</BodyText>;
};

const IsSmallField = ({
  source: _source,
  headerTooltip: _headerTooltip,
}: {
  source: string;
  headerTooltip?: boolean;
}) => {
  const record = useRecordContext();
  const translate = useTranslate();
  const isSmall: boolean | undefined = record?.is_small;

  if (isSmall == null) return null;

  const key = isSmall
    ? "controllable_unit.is_small.true"
    : "controllable_unit.is_small.false";
  const labelKey = isSmall
    ? "controllable_unit.is_small.true.label"
    : "controllable_unit.is_small.false.label";

  return (
    <Tooltip content={translate(`text.${key}`)}>
      <span>
        <BodyText size="small">{translate(`text.${labelKey}`)}</BodyText>
      </span>
    </Tooltip>
  );
};

export const ControllableUnitList = () => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();
  const canLookup = permissions?.allow("controllable_unit", "lookup");
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";

  const controllableUnitFilters = [
    <TextInput
      key="name"
      source="name@ilike"
      tooltip={false}
      className="w-[24rem]"
    />,
    <TextInput
      key="accounting_point"
      source="accounting_point.business_id@ilike"
      overrideLabel={translate("field.controllable_unit.accounting_point_id")}
      tooltip={false}
    />,
    <EnumArrayInput
      key="status"
      source="status@in"
      enumKey="controllable_unit.status"
    />,
  ];

  const fields = getFields(zControllableUnit.shape);

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

  const actions = [
    ...(canLookup ? [<CULookupButton key="lookup" />] : []),
    ...(isFiso ? [<CreateButton key="create" />] : []),
    <ExportButton key="export" exporter={exporter} maxResults={100000} />,
  ];

  return (
    <List
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={controllableUnitFilters}
      actions={actions}
      filter={{
        embed:
          "accounting_point!(bidding_zone, balance_responsible_party(balance_responsible_party))",
      }}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.name.source} weight="semibold" />
        <DateField source={fields.start_date.source} />
        <IsSmallField source={fields.is_small.source} headerTooltip />
        <AccountingPointLinkField source={fields.accounting_point_id.source} />
        <BiddingZoneField source="bidding_zone" />
        <BalanceResponsiblePartyField source="balance_responsible_party" />
        <StatusBadgeField
          source={fields.status.source}
          enumKey="controllable_unit.status"
          variantMap={cuStatusVariantMap}
        />
        <RegulationDirectionField source={fields.regulation_direction.source} />
      </Datagrid>
    </List>
  );
};
