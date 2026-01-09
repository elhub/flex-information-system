import {
  RecordContextProvider,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
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

// TODO: reduce code duplication in fields extracting a party name (BRP, ES, EU)
const BalanceResponsiblePartyInfo = () => {
  const record = useRecordContext()!;

  const { data: brpData } = useGetList(
    "accounting_point_balance_responsible_party",
    {
      filter: { accounting_point_id: record.id },
    },
  );
  const currentBRP =
    findCurrentlyValidRecord<AccountingPointBalanceResponsibleParty>(brpData);

  return (
    // we could do one more manual hop with useGetOne here,
    // but we can also just put it in the record so that React-Admin handles fetching for us
    // (also gives us i18n + link on click automatically for instance)
    <RecordContextProvider
      value={{
        ...record,
        balance_responsible_party_id: currentBRP?.balance_responsible_party_id,
      }}
    >
      <ReferenceField
        source="balance_responsible_party_id"
        reference="party"
        label="field.accounting_point_balance_responsible_party.balance_responsible_party_id"
      >
        <TextField source="name" />
      </ReferenceField>
    </RecordContextProvider>
  );
};

const BiddingZoneInfo = () => {
  const record = useRecordContext()!;

  const { data: biddingZoneData } = useGetList(
    "accounting_point_bidding_zone",
    {
      filter: { accounting_point_id: record.id },
    },
  );
  const currentBiddingZone =
    findCurrentlyValidRecord<AccountingPointBiddingZone>(biddingZoneData);

  return (
    <RecordContextProvider
      value={{ ...record, bidding_zone: currentBiddingZone?.bidding_zone }}
    >
      <EnumField
        source="bidding_zone"
        enumKey="accounting_point_bidding_zone.bidding_zone"
      />
    </RecordContextProvider>
  );
};

const EndUserInfo = () => {
  const record = useRecordContext()!;

  const { data: endUserData } = useGetList("accounting_point_end_user", {
    filter: { accounting_point_id: record.id },
  });
  const currentEndUser =
    findCurrentlyValidRecord<AccountingPointEndUser>(endUserData);

  return (
    <RecordContextProvider
      value={{ ...record, end_user_id: currentEndUser?.end_user_id }}
    >
      <ReferenceField
        source="end_user_id"
        reference="party"
        label="field.accounting_point_end_user.end_user_id"
      >
        <TextField source="name" />
      </ReferenceField>
    </RecordContextProvider>
  );
};

const EnergySupplierInfo = () => {
  const record = useRecordContext()!;

  const { data: esData } = useGetList("accounting_point_energy_supplier", {
    filter: { accounting_point_id: record.id },
  });
  const currentEnergySupplier =
    findCurrentlyValidRecord<AccountingPointEnergySupplier>(esData);

  return (
    <RecordContextProvider
      value={{
        ...record,
        energy_supplier_id: currentEnergySupplier?.energy_supplier_id,
      }}
    >
      <ReferenceField
        source="energy_supplier_id"
        reference="party"
        label="field.accounting_point_energy_supplier.energy_supplier_id"
      >
        <TextField source="name" />
      </ReferenceField>
    </RecordContextProvider>
  );
};

const MeteringGridAreaInfo = () => {
  const record = useRecordContext()!;

  const { data: mgaData } = useGetList("accounting_point_metering_grid_area", {
    filter: { accounting_point_id: record.id },
  });
  const currentMGA =
    findCurrentlyValidRecord<AccountingPointMeteringGridArea>(mgaData);

  return (
    <RecordContextProvider
      value={{
        ...record,
        metering_grid_area_id: currentMGA?.metering_grid_area_id,
      }}
    >
      <ReferenceField
        source="metering_grid_area_id"
        reference="metering_grid_area"
        label="field.accounting_point_metering_grid_area.metering_grid_area_id"
      >
        <TextField source="price_area" />
      </ReferenceField>
    </RecordContextProvider>
  );
};

export const AccountingPointShow = () => (
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

        <Typography variant="h6" gutterBottom>
          Connections
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          {/* cannot use ReferenceField for the following fields because we need
              to manually filter valid time to extract the active record */}
          <BalanceResponsiblePartyInfo />
          <BiddingZoneInfo />
          <EndUserInfo />
          <EnergySupplierInfo />
          <MeteringGridAreaInfo />
          {/* current SO is already part of AP resource */}
          <ReferenceField
            source="system_operator_id"
            reference="party"
            label="field.accounting_point.system_operator_id"
          >
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>

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
