import {
  required,
  SelectInput,
  SimpleForm,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { Toolbar } from "../../components/Toolbar";
import {
  PartyReferenceInput,
  InputStack,
  AutocompleteReferenceInput,
} from "../../auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ServiceProvidingGroupGridSuspension } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import { zServiceProvidingGroupGridSuspension } from "../../generated-client/zod.gen";

export type ServiceProvidingGroupGridSuspensionLocationState = {
  spggs: Partial<ServiceProvidingGroupGridSuspension>;
};

// common layout to create and edit pages
export const ServiceProvidingGroupGridSuspensionInput = () => {
  const locationState =
    useLocationState<ServiceProvidingGroupGridSuspensionLocationState>();
  const overrideRecord =
    zServiceProvidingGroupGridSuspension.safeParse(locationState?.spggs).data ||
    {};

  const actualRecord = useRecordContext<ServiceProvidingGroupGridSuspension>();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record: ServiceProvidingGroupGridSuspension = {
    ...actualRecord,
    ...overrideRecord,
  };

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={zodResolver(zServiceProvidingGroupGridSuspension)}
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
            label="field.service_providing_group_grid_suspension.service_providing_group_id"
            readOnly={!!record?.service_providing_group_id}
          />
        </InputStack>
        <InputStack direction="row" flexWrap="wrap">
          {!isSystemOperator && (
            <PartyReferenceInput
              source="impacted_system_operator_id"
              label="field.service_providing_group_grid_suspension.impacted_system_operator_id"
              filter={{ type: "system_operator" }}
            />
          )}
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Grid suspension process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="reason"
            label="field.service_providing_group_grid_suspension.reason"
            validate={required()}
            choices={[
              "breach_of_conditions",
              "significant_group_change",
              "other",
            ]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
