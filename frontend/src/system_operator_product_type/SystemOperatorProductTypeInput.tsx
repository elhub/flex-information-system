import {
  required,
  SelectInput,
  SimpleForm,
  useGetIdentity,
  useGetList,
  useRecordContext,
  useTranslateLabel,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { PartyReferenceInput, InputStack, useCreateOrUpdate } from "../auth";
import { Toolbar } from "../components/Toolbar";

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

  const { data } = useGetList("product_type");
  const translateLabel = useTranslateLabel();

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

  const productTypes = data?.map((product_type) => {
    return {
      id: product_type.id,
      name: translateLabel({ source: product_type.business_id }),
    };
  });
  productTypes?.sort((pt1, pt2) => pt1.id - pt2.id);

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      toolbar={<Toolbar saveAlwaysEnabled />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <PartyReferenceInput
            source="system_operator_id"
            readOnly={isSystemOperator}
          />
          <SelectInput
            source="product_type_id"
            validate={required()}
            choices={productTypes}
          />
          <SelectInput
            source="status"
            validate={required()}
            choices={["active", "inactive"]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
