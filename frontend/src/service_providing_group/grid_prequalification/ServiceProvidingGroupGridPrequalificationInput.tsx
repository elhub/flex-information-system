import { required, SimpleForm, useRecordContext } from "react-admin";
import { Typography, Stack } from "@mui/material";
import {
  AutocompleteReferenceInput,
  InputStack,
  PartyReferenceInput,
  useCreateOrUpdate,
} from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { DateTimeInput } from "../../components/datetime";
import { useMemo } from "react";
import { zServiceProvidingGroupGridPrequalification } from "../../generated-client/zod.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnumInput } from "../../components/enum";

// keep only the fields that map to the UI
const filterRecord = ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  prequalified_at,
}: any) => ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  prequalified_at,
});

// common layout to create and edit pages
export const ServiceProvidingGroupGridPrequalificationInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  // priority to the restored values if they exist, otherwise normal edit mode
  // Memoize the combined record to avoid re-renders causing errors
  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={zodResolver(zServiceProvidingGroupGridPrequalification)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <AutocompleteReferenceInput
            source="service_providing_group_id"
            reference="service_providing_group"
            label="field.service_providing_group_grid_prequalification.service_providing_group_id"
            readOnly={record?.service_providing_group_id}
          />
          <PartyReferenceInput
            source="impacted_system_operator_id"
            label="field.service_providing_group_grid_prequalification.impacted_system_operator_id"
            filter={{ type: "system_operator" }}
          />
          <EnumInput
            source="status"
            enumKey="service_providing_group_grid_prequalification.status"
            label="field.service_providing_group_grid_prequalification.status"
            validate={createOrUpdate == "update" ? required() : undefined}
          />
          <DateTimeInput
            source="prequalified_at"
            label="field.service_providing_group_grid_prequalification.prequalified_at"
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
