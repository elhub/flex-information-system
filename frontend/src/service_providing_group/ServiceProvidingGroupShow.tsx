import {
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useResourceContext,
} from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import { NestedResourceHistoryButton, ResourceHistoryButton } from "../history";
import { ServiceProvidingGroupMembershipList } from "./membership/ServiceProvidingGroupMembershipList";
import { DateField } from "../datetime";
import { ServiceProvidingGroupGridPrequalificationList } from "./grid_prequalification/ServiceProvidingGroupGridPrequalificationList";
import { EventButton } from "../event/EventButton";
import { ServiceProvidingGroupProductApplicationList } from "./product_application/ServiceProvidingGroupProductApplicationList";

export const ServiceProvidingGroupShow = () => {
  const resource = useResourceContext()!;

  const isHistory = resource.endsWith("_history");

  return (
    <Show>
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="id" label="ID" />
            <TextField source="name" />
            <ReferenceField source="service_provider_id" reference="party">
              <TextField source="name" />
            </ReferenceField>
            <TextField source="status" />
          </FieldStack>
          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <TextField source="recorded_by" />
            <DateField source="replaced_at" showTime />
            <TextField source="replaced_by" />
          </FieldStack>
        </Stack>
        <ResourceHistoryButton />
        {!isHistory && <EventButton />}
        {!isHistory && (
          <>
            <Typography variant="h6" gutterBottom>
              Controllable units
            </Typography>
            <NestedResourceHistoryButton
              child="membership"
              label="memberships in this group"
            />
            <ServiceProvidingGroupMembershipList />
            <Typography variant="h6" gutterBottom>
              Grid prequalification
            </Typography>
            <NestedResourceHistoryButton
              child="grid_prequalification"
              label="grid prequalification resources"
            />
            <ServiceProvidingGroupGridPrequalificationList />
            <Typography variant="h6" gutterBottom>
              Product applications
            </Typography>
            <NestedResourceHistoryButton
              child="product_application"
              label="product applications"
            />
            <ServiceProvidingGroupProductApplicationList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};
