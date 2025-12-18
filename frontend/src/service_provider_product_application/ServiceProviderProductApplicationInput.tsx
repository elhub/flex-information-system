import {
  required,
  SimpleForm,
  useGetIdentity,
  useGetList,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { PartyReferenceInput, InputStack, useCreateOrUpdate } from "../auth";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { DateTimeInput } from "../components/datetime";
import { Toolbar } from "../components/Toolbar";
import { ProductTypeArrayInput } from "../product_type/components";
import { zServiceProviderProductApplication } from "../generated-client/zod.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnumInput } from "../components/enum";

// keep only the fields that map to the UI
const filterRecord = ({
  service_provider_id,
  system_operator_id,
  product_type_ids,
  status,
  notes,
  qualified_at,
}: any) => ({
  service_provider_id,
  system_operator_id,
  product_type_ids,
  status,
  notes,
  qualified_at,
});

// component restricting the selectable product types based on the
// already selected system operator
const ProductTypesInput = (props: any) => {
  const formContext = useFormContext();

  const systemOperatorID = formContext.watch("system_operator_id");

  // The useEffect block below will be executed once when the page is loaded,
  // then only when the SO changes. We use a flag here so that the first run of
  // the block has no effect, so this component can be used in an Edit page
  // without the list being emptied from the existing value.
  const [freshPage, setFreshPage] = useState(true);

  // reset product types when system operator changes
  //   This reset is needed because the former list may contain product types
  //   the new SO is not asking for, which will hide them from the UI but keep
  //   them in the form value, thus potentially leading to an API error that is
  //   hard to fix in the UI.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (freshPage) {
      setFreshPage(false);
    } else {
      formContext.setValue("product_type_ids", []);
    }
  }, [systemOperatorID]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const { data: systemOperatorProductTypes } = useGetList(
    "system_operator_product_type",
    {
      filter: systemOperatorID ? { system_operator_id: systemOperatorID } : {},
    },
  );

  const filter = systemOperatorID
    ? (pt: any) =>
        systemOperatorProductTypes?.find(
          (sopt: any) => sopt.product_type_id == pt.id,
        ) != undefined
    : undefined;

  return <ProductTypeArrayInput filter={filter} {...props} />;
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
        ? identity?.partyID
        : currentRecord?.service_provider_id,
  });

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={zodResolver(zServiceProviderProductApplication)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <PartyReferenceInput
            source="service_provider_id"
            label="field.service_provider_product_application.service_provider_id"
            readOnly={isServiceProvider}
          />
          <PartyReferenceInput
            source="system_operator_id"
            label="field.service_provider_product_application.system_operator_id"
          />
          <ProductTypesInput
            source="product_type_ids"
            label="field.service_provider_product_application.product_type_ids"
          />
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Application process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <EnumInput
            source="status"
            enumKey="service_provider_product_application.status"
            label="field.service_provider_product_application.status"
            validate={required()}
          />
          <DateTimeInput
            source="qualified_at"
            label="field.service_provider_product_application.qualified_at"
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
