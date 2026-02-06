import { Form, useRecordContext } from "ra-core";
import { zTechnicalResource } from "../../generated-client/zod.gen";
import { TechnicalResource } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import { zTechnicalResourceCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../util";
import { FormContainer, Heading, FlexDiv } from "../../components/ui";
import {
  TextInput,
  TextAreaInput,
  AutocompleteReferenceInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";

export type TechnicalResourceInputLocationState = {
  technicalResource?: Partial<TechnicalResource>;
};

export const TechnicalResourceInput = () => {
  const locationState = useLocationState<TechnicalResourceInputLocationState>();
  const technicalResourceOverride = zTechnicalResource
    .partial()
    .parse(locationState?.technicalResource ?? {});

  const record = useRecordContext<TechnicalResource>();

  const overriddenRecord = {
    ...record,
    ...technicalResourceOverride,
  };

  const fields = getFields(zTechnicalResourceCreateRequest.shape);

  return (
    <Form
      record={overriddenRecord}
      resolver={unTypedZodResolver(zTechnicalResourceCreateRequest)}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <TextInput {...fields.name} />
          <AutocompleteReferenceInput
            {...fields.controllable_unit_id}
            reference="controllable_unit"
            readOnly
          />
          <TextAreaInput {...fields.details} rows={3} />
        </FlexDiv>

        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
