import {
  required,
  SelectArrayInput,
  SelectInput,
  SimpleForm,
  TextInput,
  useGetIdentity,
  useGetList,
  useRecordContext,
  useTranslateLabel,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { PartyReferenceInput, InputStack, useCreateOrUpdate } from "../auth";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { DateTimeInput } from "../datetime";
import { Toolbar } from "../Toolbar";

// keep only the fields that map to the UI
const filterRecord = ({
  service_provider_id,
  system_operator_id,
  product_type_ids,
  status,
  notes,
  last_qualified,
}: any) => ({
  service_provider_id,
  system_operator_id,
  product_type_ids,
  status,
  notes,
  last_qualified,
});

// component restricting the selectable product types based on the
// already selected system operator
const ProductTypesInput = (props: any) => {
  const formContext = useFormContext();
  const translateLabel = useTranslateLabel();

  const systemOperatorID = formContext.watch("system_operator_id");

  // reset product types when system operator changes
  useEffect(() => {
    // This is needed because the former list may contain product types the new
    // SO is not asking for, which will hide them from the UI but keep them in
    // the form value, thus potentially leading to an API error that is hard to
    // fix in the UI.
    formContext.setValue("product_type_ids", []);
  }, [systemOperatorID]);

  const { data: allProductTypes } = useGetList("product_type");
  const { data: systemOperatorProductTypes } = useGetList(
    "system_operator_product_type",
    {
      filter: systemOperatorID ? { system_operator_id: systemOperatorID } : {},
    },
  );

  const productTypes = (
    systemOperatorID
      ? // if SO ID is given, allow only to select the product types this SO asked for
        allProductTypes?.filter(
          (pt) =>
            systemOperatorProductTypes?.find(
              (sopt) => sopt.product_type_id == pt.id,
            ) != undefined,
        )
      : // otherwise allow all product types
        allProductTypes
  )?.map((productType) => {
    return {
      id: productType.id,
      name: translateLabel({ source: productType.business_id }),
    };
  });
  productTypes?.sort((pt1, pt2) => pt1.id - pt2.id);

  return <SelectArrayInput choices={productTypes} {...props} />;
};

// common layout to create and edit pages
export const ServiceProviderProductApplicationInput = () => {
  const currentRecord = useRecordContext();
  const createOrUpdate = useCreateOrUpdate();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isServiceProvider = identity?.role == "flex_service_provider";

  const record = filterRecord({
    ...currentRecord,
    service_provider_id:
      createOrUpdate == "create" && isServiceProvider
        ? identity?.party_id
        : currentRecord?.service_provider_id,
  });

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
            source="service_provider_id"
            readOnly={isServiceProvider}
          />
          <PartyReferenceInput source="system_operator_id" />
          <ProductTypesInput source="product_type_ids" label="Product types" />
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Application process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="status"
            validate={required()}
            choices={[
              "requested",
              "in_progress",
              "communication_test",
              "not_qualified",
              "qualified",
            ]}
          />
          <TextInput
            source="notes"
            multiline={true}
            minRows={3}
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
          <DateTimeInput source="last_qualified" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
