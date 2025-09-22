import {
  Button,
  RichTextField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../../auth";
import { NestedResourceHistoryButton } from "../../components/history";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { EventButton } from "../../event/EventButton";
import { IdentityField } from "../../components/IdentityField";

export const ServiceProviderProductSuspensionCommentShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  const isHistory = resource.endsWith("_history");

  const EditButton = () => {
    const record = useRecordContext()!;
    return (
      <Button
        component={Link}
        to={`/service_provider_product_suspension/${record.service_provider_product_suspension_id}/comment/${record.id}`}
        startIcon={<EditIcon />}
        label="Edit"
      />
    );
  };

  return (
    <Show
      actions={
        !isHistory &&
        permissions.includes(
          "service_provider_product_suspension_comment.update",
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
            <TextField
              source="service_provider_product_suspension_id"
              label="Service provider product suspension ID"
            />
            <IdentityField source="created_by" />
            <TextField source="visibility" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Content
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <RichTextField source="content" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="created_at" showTime />
            <DateField source="recorded_at" label="Last updated" showTime />
            <IdentityField source="recorded_by" />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton />}
        <NestedResourceHistoryButton
          parent="service_provider_product_suspension"
          child="comment"
          label="comments"
        />
      </SimpleShowLayout>
    </Show>
  );
};
