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
      toolbar={<Toolbar saveAlwaysEnabled />}
    >
      <Stack direction="column" spacing={1}>
        <PartyReferenceInput
          source="service_provider_id"
          readOnly={is_service_provider}
        />
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="name" label="Group name" />
          <SelectInput
            source="status"
            validate={createOrUpdate == "update" ? required() : undefined}
            choices={["new", "active", "terminated"]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
