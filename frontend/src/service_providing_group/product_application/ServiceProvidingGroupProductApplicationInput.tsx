import { useRecordContext } from "react-admin";
import { Form, useGetList } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { getFields, unTypedZodResolver } from "../../zod";
import { useCreateOrUpdate } from "../../auth";
import { zServiceProvidingGroupProductApplicationCreateRequest } from "../../generated-client/zod.gen";
import { FormContainer, Heading, VerticalSpace } from "../../components/ui";
import {
  TextInput,
  TextAreaInput,
  EnumInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  DateTimeInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../../product_type/components";

// keep only the fields that map to the UI
const filterRecord = ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  status,
  additional_information,
  maximum_active_power,
  prequalified_at,
  verified_at,
}: any) => ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  status,
  additional_information,
  maximum_active_power,
  prequalified_at,
  verified_at,
});

// component restricting the selectable product types based on the
// already selected procuring system operator
const ProductTypesInput = (props: { source: string; required: boolean }) => {
  const formContext = useFormContext();

  const systemOperatorID = formContext.watch("procuring_system_operator_id");

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
export const ServiceProvidingGroupProductApplicationInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  // Memoize the combined record to avoid re-renders causing errors
  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );
  const createOrUpdate = useCreateOrUpdate();

  const fields = getFields(
    zServiceProvidingGroupProductApplicationCreateRequest.shape,
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupProductApplicationCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <VerticalSpace size="small" />
        <AutocompleteReferenceInput
          {...fields.service_providing_group_id}
          reference="service_providing_group"
          readOnly={!!record?.service_providing_group_id}
        />
        <PartyReferenceInput
          {...fields.procuring_system_operator_id}
          filter={{ type: "system_operator" }}
        />
        <ProductTypesInput {...fields.product_type_ids} />
        <Heading level={3} size="medium">
          Application process
        </Heading>
        <VerticalSpace size="small" />
        <EnumInput
          {...fields.status}
          enumKey="service_providing_group_product_application.status"
          defaultValue="requested"
          readOnly={createOrUpdate === "create"}
        />
        <TextInput {...fields.maximum_active_power} type="number" />
        <TextAreaInput {...fields.additional_information} />
        <DateTimeInput {...fields.prequalified_at} />
        <DateTimeInput {...fields.verified_at} />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
