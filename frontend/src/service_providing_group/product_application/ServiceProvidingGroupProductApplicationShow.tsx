import {
  Button,
  FunctionField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
  useResourceContext,
  useTranslateLabel,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { NestedResourceHistoryButton } from "../../history";
import { EventButton } from "../../event/EventButton";
import { DateField } from "../../datetime";
import { FieldStack } from "../../auth";
import { IdentityField } from "../../IdentityField";

export const ServiceProvidingGroupProductApplicationShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  const isHistory = resource.endsWith("_history");

  const EditButton = () => {
    const record = useRecordContext()!;
    return (
      <Button
        component={Link}
        to={`/service_providing_group/${record.service_providing_group_id}/product_application/${record.id}`}
        startIcon={<EditIcon />}
        label="Edit"
      />
    );
  };

  const translateLabel = useTranslateLabel();

  return (
    <Show
      actions={
        !isHistory &&
        permissions.includes(
          "service_providing_group_product_application.update",
        ) && (
          <TopToolbar>
            <EditButton />
          </TopToolbar>
        )
      }
    >
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="id" label="ID" />
            <ReferenceField
              source="service_providing_group_id"
              reference="service_providing_group"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="procuring_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="product_type_id" reference="product_type">
              <FunctionField
                source="business_id"
                render={(record) =>
                  translateLabel({ source: record.business_id })
                }
              />
            </ReferenceField>
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Application process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="status" />
            <TextField source="notes" />
            <DateField source="last_prequalified" showTime />
            <DateField source="last_verified" showTime />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            <DateField source="replaced_at" showTime />
            <IdentityField source="replaced_by" />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton />}
        <NestedResourceHistoryButton
          parent="service_providing_group"
          child="product_application"
          label="product applications"
        />
      </SimpleShowLayout>
    </Show>
  );
};
