import { useGetIdentity, useTranslate } from "ra-core";
import { Divider, Heading } from "../../components/ui";
import { zServiceProvidingGroupCreateRequest } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";
import { EnumInput } from "../../components/EDS-ra/inputs/EnumInput";
import { PartyReferenceInput } from "../../components/EDS-ra/inputs/PartyReferenceInput";
import { TextAreaInput } from "../../components/EDS-ra/inputs/TextAreaInput";
import { TextInput } from "../../components/EDS-ra/inputs/TextInput";

type Props = {
  isEdit?: boolean;
};

export const ServiceProvidingGroupFields = ({ isEdit }: Props) => {
  const translate = useTranslate();
  const { data: identity } = useGetIdentity();
  const isServiceProvider = identity?.role === "flex_service_provider";
  const fields = getFields(zServiceProvidingGroupCreateRequest.shape);

  return (
    <>
      {!isServiceProvider && (
        <PartyReferenceInput
          {...fields.service_provider_id}
          description
          tooltip={false}
        />
      )}
      <TextInput {...fields.name} description tooltip={false} />
      <EnumInput
        {...fields.bidding_zone}
        enumKey="service_providing_group.bidding_zone"
        required
        tooltip={false}
        description
      />
      {isEdit && (
        <EnumInput
          {...fields.status}
          enumKey="service_providing_group.status"
          required
          tooltip={false}
          description
        />
      )}
      <div className="pt-6 pb-3">
        <Divider />
      </div>
      <Heading level={4} size="small" className="pb-3">
        Other
      </Heading>
      <TextAreaInput
        {...fields.additional_information}
        rows={5}
        description
        placeholder={translate(
          "text.spg_create_additional_information_placeholder",
        )}
        descriptionOverride={translate(
          "text.spg_create_additional_information_override_description",
        )}
        tooltip={false}
        warning="Please remember not to write any sensitive (power/market/personal) information in this field."
      />
    </>
  );
};
