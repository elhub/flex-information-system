import { Form, useRecordContext, useTranslate } from "ra-core";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useCreateOrUpdate } from "../../auth";
import { zServiceProvidingGroupMembershipCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading, FlexDiv } from "../../components/ui";
import {
  AutocompleteReferenceInput,
  DateInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ValidTimeTooltip } from "../../components/ValidTimeTooltip";

const filterRecord = ({
  service_providing_group_id,
  controllable_unit_id,
  valid_from,
  valid_to,
}: any) => ({
  service_providing_group_id,
  controllable_unit_id,
  valid_from,
  valid_to,
});

const fields = getFields(zServiceProvidingGroupMembershipCreateRequest.shape);

export const ServiceProvidingGroupMembershipInput = () => {
  const translate = useTranslate();
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const createOrUpdate = useCreateOrUpdate();

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupMembershipCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          {createOrUpdate === "update" &&
            translate("text.spg_membership_edit_title")}
        </Heading>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.service_providing_group_id}
            reference="service_providing_group"
            readOnly={!!overrideRecord?.service_providing_group_id}
          />
          <AutocompleteReferenceInput
            {...fields.controllable_unit_id}
            reference="controllable_unit"
          />
        </div>

        <FlexDiv
          style={{
            gap: "var(--eds-size-2)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Heading level={4} size="small">
            Valid time
          </Heading>
          <ValidTimeTooltip />
        </FlexDiv>

        <div className="flex flex-col gap-3">
          <DateInput {...fields.valid_from} outputFormat="date-time" />
          <DateInput {...fields.valid_to} outputFormat="date-time" />
        </div>

        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
