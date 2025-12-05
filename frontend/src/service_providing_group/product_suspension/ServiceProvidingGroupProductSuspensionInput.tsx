import {
  required,
  SelectInput,
  SimpleForm,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { Toolbar } from "../../components/Toolbar";
import { useLocation } from "react-router-dom";
import {
  PartyReferenceInput,
  InputStack,
  AutocompleteReferenceInput,
} from "../../auth";
import { useMemo } from "react";
import { ProductTypeArrayInput } from "../../product_type/components";

const filterRecord = ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  reason,
}: any) => ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  reason,
});

export const ServiceProvidingGroupProductSuspensionInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <SimpleForm record={record} maxWidth={1280} toolbar={<Toolbar />}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <AutocompleteReferenceInput
            source="service_providing_group_id"
            reference="service_providing_group"
            readOnly={!!record?.service_providing_group_id}
          />
        </InputStack>
        <InputStack direction="row" flexWrap="wrap">
          {!isSystemOperator && (
            <PartyReferenceInput
              source="procuring_system_operator_id"
              filter={{ type: "system_operator" }}
            />
          )}
        </InputStack>
        <ProductTypeArrayInput
          source="product_type_ids"
          label="Product types"
        />
        <Typography variant="h6" gutterBottom>
          Product suspension process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="reason"
            validate={required()}
            choices={["failed_verification", "other"]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
