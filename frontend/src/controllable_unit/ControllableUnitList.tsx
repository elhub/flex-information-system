import { Link as RouterLink } from "react-router-dom";
import { useRecordContext, useTranslate } from "ra-core";
import { ExportButton } from "react-admin";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  StatusBadgeField,
  TextField,
} from "../components/EDS-ra/fields";
import { EnumArrayInput, TextInput } from "../components/EDS-ra/inputs";
import { cuStatusVariantMap } from "./controllableUnitStatus";
import { RegulationDirectionField } from "./RegulationDirectionField";
import { BodyText, Button, Tooltip } from "../components/ui";
import { findCurrentlyValidRecord } from "../util";
import type {
  AccountingPointBalanceResponsibleParty,
  AccountingPointBiddingZone,
} from "../generated-client";
import { AccountingPointLinkField } from "../accounting_point/AccountingPointLinkField";
import { useControllableUnitListController } from "./useControllableUnitListController";
import { IconPlus } from "@elhub/ds-icons";

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

// RA-bridge field renderers: these read the current row via
// useRecordContext(), so they must remain components rendered inside
// Datagrid's per-row context (they can't be plain data returned from a
// hook, unlike SimpleTable's render functions).
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

// Presentational: the controller hook returns plain booleans/labels/
// functions/config only. This component decides which JSX (filters,
// actions) to build from that data. List/Datagrid stay as the established
// RA-bridge components.
export const ControllableUnitList = () => {
  const {
    fields,
    canLookup,
    isFiso,
    accountingPointFilterLabel,
    exporter,
    sort,
    filter,
  } = useControllableUnitListController();

  const filters = [
    <TextInput
      key="name"
      source="name@ilike"
      tooltip={false}
      className="w-[24rem]"
    />,
    <TextInput
      key="accounting_point"
      source="accounting_point.business_id@ilike"
      overrideLabel={accountingPointFilterLabel}
      tooltip={false}
    />,
    <EnumArrayInput
      key="status"
      source="status@in"
      enumKey="controllable_unit.status"
    />,
  ];

  const actions = [
    ...(canLookup ? [<CULookupButton key="lookup" />] : []),
    ...(isFiso ? [<CreateButton key="create" />] : []),
    <ExportButton key="export" exporter={exporter} maxResults={100000} />,
  ];

  return (
    <List
      sort={sort}
      empty={false}
      filters={filters}
      actions={actions}
      filter={filter}
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
