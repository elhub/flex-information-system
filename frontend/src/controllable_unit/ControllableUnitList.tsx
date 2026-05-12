import { Link } from "react-router-dom";
import {
  useGetIdentity,
  useGetList,
  useGetOne,
  usePermissions,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { ExportButton } from "react-admin";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import { EnumArrayInput } from "../components/EDS-ra/inputs";
import { BodyText, Button } from "../components/ui";
import { Permissions } from "../auth/permissions";
import { zControllableUnit } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { IconPlus } from "@elhub/ds-icons";
import { findCurrentlyValidRecord } from "../util";
import type {
  AccountingPointBiddingZone,
  AccountingPointBalanceResponsibleParty,
} from "../generated-client";

const CULookupButton = () => (
  <Button
    as={Link}
    icon={IconPlus}
    to="/controllable_unit/lookup"
    variant="invisible"
  >
    Create
  </Button>
);

const CreateButton = () => (
  <Button
    as={Link}
    icon={IconPlus}
    to="/controllable_unit/create"
    variant="invisible"
  >
    Create manually
  </Button>
);

// custom component resolving the bidding zone through the accounting point
// (keeping source for React-Admin behaviour)
const BiddingZoneField = ({ source: _source }: { source: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  const { data } = useGetList(
    "accounting_point_bidding_zone",
    {
      filter: { accounting_point_id: record?.accounting_point_id },
      // default sort is on `id` which does not exist on AP-BZ
      sort: { field: "valid_from", order: "DESC" },
    },
    { enabled: !!record?.accounting_point_id },
  );

  const current = findCurrentlyValidRecord(
    data as AccountingPointBiddingZone[] | undefined,
  );

  if (!current) return <BodyText size="small">-</BodyText>;
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
  const { data } = useGetList(
    "accounting_point_balance_responsible_party",
    {
      filter: { accounting_point_id: record?.accounting_point_id },
      // default sort is on `id` which does not exist on AP-BRP either
      sort: { field: "valid_from", order: "DESC" },
    },
    { enabled: !!record?.accounting_point_id },
  );

  const current = findCurrentlyValidRecord(
    data as AccountingPointBalanceResponsibleParty[] | undefined,
  );

  const { data: party } = useGetOne(
    "party",
    { id: current?.balance_responsible_party_id },
    { enabled: !!current?.balance_responsible_party_id },
  );

  if (!party) return <BodyText size="small">-</BodyText>;
  return <BodyText size="small">{party.name}</BodyText>;
};

export const ControllableUnitList = () => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const canLookup = permissions?.allow("controllable_unit", "lookup");
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";

  const controllableUnitFilters = [
    <EnumArrayInput
      key="status"
      source="status@in"
      enumKey="controllable_unit.status"
    />,
  ];

  const fields = getFields(zControllableUnit.shape);

  const actions = [
    ...(canLookup ? [<CULookupButton key="lookup" />] : []),
    ...(isFiso ? [<CreateButton key="create" />] : []),
    <ExportButton key="export" />,
  ];

  return (
    <List
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={controllableUnitFilters}
      actions={actions}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.business_id.source} />
        <TextField source={fields.name.source} />
        <DateField source={fields.start_date.source} />
        <EnumField
          source={fields.status.source}
          enumKey="controllable_unit.status"
        />
        <EnumField
          source={fields.regulation_direction.source}
          enumKey="controllable_unit.regulation_direction"
        />
        <TextField source={fields.is_small.source} />
        <ReferenceField
          source={fields.accounting_point_id.source}
          reference="accounting_point"
        >
          <TextField source="business_id" />
        </ReferenceField>
        <BiddingZoneField source="bidding_zone" />
        <BalanceResponsiblePartyField source="balance_responsible_party" />
        <DateField source={fields.recorded_at.source} showTime />
      </Datagrid>
    </List>
  );
};
