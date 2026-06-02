import { Form, useRecordContext } from "ra-core";
import { zTechnicalResource } from "../../generated-client/zod.gen";
import { TechnicalResource } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import { zTechnicalResourceCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, BodyText, Heading, FlexDiv } from "../../components/ui";
import {
  TextInput,
  TextAreaInput,
  AutocompleteReferenceInput,
  EnumInput,
  EnumArrayInput,
  UnitInput,
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
          Create technical resource
        </Heading>

        <BodyText>
          Each technical resource represents a specific device within the
          controllable unit.
        </BodyText>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <TextInput {...fields.name} description tooltip={false} />
          <AutocompleteReferenceInput
            {...fields.controllable_unit_id}
            reference="controllable_unit"
            description
            tooltip={false}
            readOnly
          />
          <EnumArrayInput
            {...fields.technology}
            enumKey="technology"
            description
            tooltip={false}
          />
        </FlexDiv>

        <Heading level={3} size="medium" className="mt-8">
          Device
        </Heading>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <EnumInput
            {...fields.device_type}
            enumKey="device_type"
            description
            tooltip={false}
          />
          <TextInput {...fields.make} description tooltip={false} />
          <TextInput {...fields.model} description tooltip={false} />
          <UnitInput
            {...fields.maximum_active_power}
            units={[
              { label: "kW", scale: 1 },
              { label: "MW", scale: 1000 },
            ]}
            description
            tooltip={false}
          />
          <TextInput {...fields.business_id} description tooltip={false} />
          <EnumInput
            {...fields.business_id_type}
            enumKey="technical_resource.business_id_type"
            description
            tooltip={false}
          />
        </FlexDiv>

        <Heading level={3} size="medium" className="mt-8">
          Other
        </Heading>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <TextAreaInput
            {...fields.additional_information}
            rows={8}
            description
            tooltip={false}
            warning="Please remember not to write any sensitive (power/market/personal) information in this field."
          />
        </FlexDiv>

        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
