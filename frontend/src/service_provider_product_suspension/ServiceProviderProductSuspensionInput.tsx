import { required, SelectInput, SimpleForm, useGetIdentity } from "react-admin";
import { Typography, Stack } from "@mui/material";
import { PartyReferenceInput, InputStack } from "../auth";
import { Toolbar } from "../components/Toolbar";
import { ProductTypeArrayInput } from "../product_type/components";

export const ServiceProviderProductSuspensionInput = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isSystemOperator = identity?.role == "flex_system_operator";

  return (
    <SimpleForm maxWidth={1280} toolbar={<Toolbar saveAlwaysEnabled />}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          {!isSystemOperator && (
            <PartyReferenceInput
              source="procuring_system_operator_id"
              filter={{ type: "system_operator" }}
            />
          )}
          <PartyReferenceInput source="service_provider_id" />
          <ProductTypeArrayInput
            source="product_type_ids"
            label="Product types"
          />
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Suspension details
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="reason"
            validate={required()}
            choices={[
              "communication_issues",
              "failing_heartbeat",
              "system_issues",
              "clearing_issues",
              "failed_verification",
              "other",
            ]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
