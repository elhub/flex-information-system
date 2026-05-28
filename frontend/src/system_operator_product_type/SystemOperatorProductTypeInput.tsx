import { Form, useGetIdentity, useRecordContext } from "ra-core";
import { FormContainer, Heading } from "../components/ui";
import { useCreateOrUpdate } from "../auth";
import {
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { ProductTypeInput } from "../product_type/components";
import { zSystemOperatorProductTypeCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";

const filterRecord = ({
  system_operator_id,
  product_type_id,
  status,
}: any) => ({
  system_operator_id,
  product_type_id,
  status,
});

const fields = getFields(zSystemOperatorProductTypeCreateRequest.shape);

export const SystemOperatorProductTypeInput = () => {
  const currentRecord = useRecordContext();
  const createOrUpdate = useCreateOrUpdate();
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;
  const isSystemOperator = identity?.role == "flex_system_operator";
  const record = filterRecord({
    ...currentRecord,
    system_operator_id:
      createOrUpdate == "create" && isSystemOperator
        ? identity?.partyID
        : currentRecord?.system_operator_id,
  });
  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zSystemOperatorProductTypeCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <PartyReferenceInput
            {...fields.system_operator_id}
            readOnly={isSystemOperator}
          />
          <ProductTypeInput
            source="product_type_id"
            label="field.system_operator_product_type.product_type_id"
          />
          <EnumInput
            {...fields.status}
            enumKey="system_operator_product_type.status"
            required={createOrUpdate == "update"}
          />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
