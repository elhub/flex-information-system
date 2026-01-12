import {
  RecordContextProvider,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useGetIdentity,
  useGetList,
  useRecordContext,
} from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import { DateField } from "../components/datetime";
import {
  AccountingPointBalanceResponsibleParty,
  AccountingPointBiddingZone,
  AccountingPointEndUser,
  AccountingPointEnergySupplier,
  AccountingPointMeteringGridArea,
} from "../generated-client";
import { EnumField } from "../components/enum";

// helper to find the currently valid record from a timeline
const findCurrentlyValidRecord = <
  T extends { valid_from?: string; valid_to?: string },
>(
  data: T[] | undefined,
): T | undefined => {
  if (!data) return undefined;

  const now = new Date();
  return data.find((record) => {
    const validFrom = record.valid_from ? new Date(record.valid_from) : null;
    const validTo = record.valid_to ? new Date(record.valid_to) : null;

    // deleted or in the future -> skip
    if (validFrom === null || validFrom > now) return undefined;
    // expired -> skip
    if (validTo !== null && validTo <= now) return undefined;
    // remaining case: currently valid
    return record;
  });
};

const AccountingPointConnections = () => {
  const record = useRecordContext()!;

  const { data: brpData } = useGetList(
    "accounting_point_balance_responsible_party",
    {
      filter: { accounting_point_id: record.id },
      // NB: `sort` required because the resource does not have an `id` field,
      // and the default sort in RA uses it (same for similar resources below)
      sort: { field: "accounting_point_id", order: "ASC" },
    },
  );
  const currentBRP =
    findCurrentlyValidRecord<AccountingPointBalanceResponsibleParty>(brpData);

  const { data: biddingZoneData } = useGetList(
    "accounting_point_bidding_zone",
    {
      filter: { accounting_point_id: record.id },
      sort: { field: "accounting_point_id", order: "ASC" },
    },
  );
  const currentBiddingZone =
    findCurrentlyValidRecord<AccountingPointBiddingZone>(biddingZoneData);

  const { data: endUserData } = useGetList("accounting_point_end_user", {
    filter: { accounting_point_id: record.id },
    sort: { field: "accounting_point_id", order: "ASC" },
  });
  const currentEndUser =
    findCurrentlyValidRecord<AccountingPointEndUser>(endUserData);

  const { data: esData } = useGetList("accounting_point_energy_supplier", {
    filter: { accounting_point_id: record.id },
    sort: { field: "accounting_point_id", order: "ASC" },
  });
  const currentEnergySupplier =
    findCurrentlyValidRecord<AccountingPointEnergySupplier>(esData);

  const { data: mgaData } = useGetList("accounting_point_metering_grid_area", {
    filter: { accounting_point_id: record.id },
    sort: { field: "accounting_point_id", order: "ASC" },
  });
  const currentMGA =
    findCurrentlyValidRecord<AccountingPointMeteringGridArea>(mgaData);

  return (
    <RecordContextProvider
      value={{
        ...record,
        balance_responsible_party_id: currentBRP?.balance_responsible_party_id,
        bidding_zone: currentBiddingZone?.bidding_zone,
        end_user_id: currentEndUser?.end_user_id,
        energy_supplier_id: currentEnergySupplier?.energy_supplier_id,
        metering_grid_area_id: currentMGA?.metering_grid_area_id,
      }}
    >
      {/* NB: we need a FieldStack for each field because data is picked from several resources and
              we need to change the resource context of the tooltip everytime */}
      <Stack direction="row" spacing={2}>
        <FieldStack
          direction="row"
          flexWrap="wrap"
          spacing={2}
          resource="accounting_point_balance_responsible_party"
        >
          <ReferenceField
            reference="party"
            source="balance_responsible_party_id"
            label="field.accounting_point_balance_responsible_party.balance_responsible_party_id"
          >
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>
        <FieldStack
          direction="row"
          flexWrap="wrap"
          spacing={2}
          resource="accounting_point_bidding_zone"
        >
          <EnumField
            source="bidding_zone"
            enumKey="accounting_point_bidding_zone.bidding_zone"
          />
        </FieldStack>
        <FieldStack
          direction="row"
          flexWrap="wrap"
          spacing={2}
          resource="accounting_point_end_user"
        >
          <ReferenceField
            source="end_user_id"
            reference="party"
            label="field.accounting_point_end_user.end_user_id"
          >
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>
        <FieldStack
          direction="row"
          flexWrap="wrap"
          spacing={2}
          resource="accounting_point_energy_supplier"
        >
          <ReferenceField
            source="energy_supplier_id"
            reference="party"
            label="field.accounting_point_energy_supplier.energy_supplier_id"
          >
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>
        <FieldStack
          direction="row"
          flexWrap="wrap"
          spacing={2}
          resource="accounting_point_metering_grid_area"
        >
          <ReferenceField
            source="metering_grid_area_id"
            reference="metering_grid_area"
            label="field.accounting_point_metering_grid_area.metering_grid_area_id"
          >
            <EnumField
              source="price_area"
              enumKey="metering_grid_area.price_area"
            />
          </ReferenceField>
        </FieldStack>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <ReferenceField
            source="system_operator_id"
            reference="party"
            label="field.accounting_point.system_operator_id"
          >
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>
      </Stack>
    </RecordContextProvider>
  );
};

export const AccountingPointShow = () => {
  const { identity, isPending } = useGetIdentity();

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <Show>
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="id" label="field.accounting_point.id" />
            <TextField
              source="business_id"
              label="field.accounting_point.business_id"
            />
          </FieldStack>

          {identity?.role == "flex_flexibility_information_system_operator" && (
            <>
              <Typography variant="h6" gutterBottom>
                Connections
              </Typography>
              <AccountingPointConnections />
            </>
          )}

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.accounting_point.recorded_at"
            />
          </FieldStack>
        </Stack>
      </SimpleShowLayout>
    </Show>
  );
};
