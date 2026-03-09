import { useGetIdentity } from "ra-core";
import { zServiceProvidingGroupCreateRequest } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";
import {
  EnumInput,
  PartyReferenceInput,
  TextInput,
} from "../../components/EDS-ra/inputs";

type Props = {
  isEdit?: boolean;
};

export const ServiceProvidingGroupFields = ({ isEdit }: Props) => {
  const { data: identity } = useGetIdentity();
  const isServiceProvider = identity?.role === "flex_service_provider";
  const fields = getFields(zServiceProvidingGroupCreateRequest.shape);

  return (
    <>
      {!isServiceProvider && (
        <PartyReferenceInput {...fields.service_provider_id} description />
      )}
      <TextInput {...fields.name} description />
      <EnumInput
        {...fields.bidding_zone}
        enumKey="service_providing_group.bidding_zone"
        required
        description
      />
      {isEdit && (
        <EnumInput
          {...fields.status}
          enumKey="service_providing_group.status"
          required
          description
        />
      )}
    </>
  );
};
