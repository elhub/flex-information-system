import { useGetIdentity, useGetList } from "react-admin";
import { Form, useRecordContext } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreateOrUpdate } from "../auth";
import { zServiceProviderProductApplicationCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { FormContainer, Heading, VerticalSpace } from "../components/ui";
import {
  DateTimeInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../product_type/components";

// keep only the fields that map to the UI
const filterRecord = ({
  service_provider_id,
  system_operator_id,
  product_type_ids,
  status,
  qualified_at,
}: any) => ({
  service_provider_id,
  system_operator_id,
  product_type_ids,
  status,
  qualified_at,
});

// component restricting the selectable product types based on the
// already selected system operator
const ProductTypesInput = (props: { source: string; required: boolean }) => {
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
    ? (pt: { id: number; name: string }) =>
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

  const fields = getFields(
    zServiceProviderProductApplicationCreateRequest.shape,
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProviderProductApplicationCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <VerticalSpace size="small" />
        <PartyReferenceInput
          {...fields.service_provider_id}
          readOnly={isServiceProvider}
        />
        <PartyReferenceInput {...fields.system_operator_id} />
        <ProductTypesInput {...fields.product_type_ids} />
        <Heading level={3} size="medium">
          Application process
        </Heading>
        <VerticalSpace size="small" />
        <EnumInput
          {...fields.status}
          enumKey="service_provider_product_application.status"
          placeholder="Select status"
        />
        <DateTimeInput {...fields.qualified_at} showNow />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
