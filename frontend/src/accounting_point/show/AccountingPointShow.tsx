import {
  Loading,
  RecordContextProvider,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { FieldStack } from "../../auth";
import { Typography, Stack } from "@mui/material";
import { DateField } from "../../components/datetime";
import { EnumField } from "../../components/enum";
import { useAccountingPointViewModel } from "./useAccountingPointViewModel";
import { AccountingPoint } from "../../generated-client";

const AccountingPointConnections = () => {
  const record = useRecordContext<AccountingPoint>()!;

  const {
    data: accountingPointViewModel,
    isPending,
    error,
  } = useAccountingPointViewModel(record);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    // caught by the React-Admin Error Boundary
    throw error;
  }

  return (
    <RecordContextProvider
      value={{ ...record, ...accountingPointViewModel.connections }}
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
            <TextField source="name" label="metering_grid_area.name" />
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
