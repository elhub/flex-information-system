import {
  required,
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
import {
  ServiceProvidingGroupGridSuspension,
  ServiceProvidingGroupGridSuspensionCreateRequest,
  ServiceProvidingGroupGridSuspensionUpdateRequest,
} from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import {
  zServiceProvidingGroupGridSuspension,
  zServiceProvidingGroupGridSuspensionCreateRequest,
} from "../../generated-client/zod.gen";
import { EnumInput } from "../../components/enum";
import { unTypedZodResolver } from "../../zod";

export type ServiceProvidingGroupGridSuspensionLocationState = {
  spggs: Partial<ServiceProvidingGroupGridSuspension>;
};

// common layout to create and edit pages
export const ServiceProvidingGroupGridSuspensionInput = () => {
  const locationState =
    useLocationState<ServiceProvidingGroupGridSuspensionLocationState>();
  const overrideRecord = zServiceProvidingGroupGridSuspension
    .partial()
    .safeParse(locationState?.spggs ?? {});

  const actualRecord = useRecordContext<ServiceProvidingGroupGridSuspension>();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record:
    | ServiceProvidingGroupGridSuspensionCreateRequest
    | ServiceProvidingGroupGridSuspensionUpdateRequest = {
    ...actualRecord,
    ...overrideRecord,
  };

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupGridSuspensionCreateRequest,
      )}
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
            readOnly={
              "service_providing_group_id" in record &&
              !!record.service_providing_group_id
            }
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
          <EnumInput
            source="reason"
            enumKey="service_providing_group_grid_suspension.reason"
            label="field.service_providing_group_grid_suspension.reason"
            validate={required()}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
