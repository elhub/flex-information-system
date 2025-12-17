import {
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useGetIdentity,
} from "react-admin";
import { InputStack, useCreateOrUpdate, PartyReferenceInput } from "../auth";
import { Stack } from "@mui/material";
import { Toolbar } from "../components/Toolbar";
import { zServiceProvidingGroup } from "../generated-client/zod.gen";
import { zodResolver } from "@hookform/resolvers/zod";

// common layout to create and edit pages
export const ServiceProvidingGroupInput = () => {
  const createOrUpdate = useCreateOrUpdate();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const is_service_provider = identity?.role == "flex_service_provider";
  const record = is_service_provider
    ? {
        service_provider_id: identity?.partyID,
      }
    : {};

  return (
    <SimpleForm
      defaultValues={record}
      maxWidth={1280}
      resolver={zodResolver(zServiceProvidingGroup)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <PartyReferenceInput
          source="service_provider_id"
          label="field.service_providing_group.service_provider_id"
          readOnly={is_service_provider}
        />
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="name" label="field.service_providing_group.name" />
          <SelectInput
            source="bidding_zone"
            label="field.service_providing_group.bidding_zone"
            validate={createOrUpdate == "update" ? required() : undefined}
            choices={["NO1", "NO2", "NO3", "NO4", "NO5"]}
          />
          <SelectInput
            source="status"
            label="field.service_providing_group.status"
            validate={createOrUpdate == "update" ? required() : undefined}
            choices={["new", "active", "inactive", "terminated"]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
