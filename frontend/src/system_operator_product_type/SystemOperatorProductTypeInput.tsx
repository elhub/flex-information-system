import {
  required,
  SimpleForm,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { PartyReferenceInput, InputStack, useCreateOrUpdate } from "../auth";
import { Toolbar } from "../components/Toolbar";
import { ProductTypeInput } from "../product_type/components";
import { zSystemOperatorProductTypeCreateRequest } from "../generated-client/zod.gen";
import { EnumInput } from "../components/enum";
import { unTypedZodResolver } from "../util";

// keep only the fields that map to the UI
const filterRecord = ({
  system_operator_id,
  product_type_id,
  status,
}: any) => ({
  system_operator_id,
  product_type_id,
  status,
});

// common layout to create and edit pages
export const SystemOperatorProductTypeInput = () => {
  const currentRecord = useRecordContext();
  const createOrUpdate = useCreateOrUpdate();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isSystemOperator = identity?.role == "flex_system_operator";

  // an SO can only link product types to themselves
  const record = filterRecord({
    ...currentRecord,
    system_operator_id:
      createOrUpdate == "create" && isSystemOperator
        ? identity?.partyID
        : currentRecord?.system_operator_id,
  });

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={unTypedZodResolver(zSystemOperatorProductTypeCreateRequest)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <PartyReferenceInput
            source="system_operator_id"
            label="field.system_operator_product_type.system_operator_id"
            readOnly={isSystemOperator}
          />
          <ProductTypeInput
            source="product_type_id"
            label="field.system_operator_product_type.product_type_id"
            validate={required()}
          />
          <EnumInput
            source="status"
            enumKey="system_operator_product_type.status"
            label="field.system_operator_product_type.status"
            validate={required()}
            choices={["active", "inactive"]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
