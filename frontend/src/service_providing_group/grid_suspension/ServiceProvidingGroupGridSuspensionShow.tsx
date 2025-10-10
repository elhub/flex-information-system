import {
  Button,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { NestedResourceHistoryButton } from "../../components/history";
import { EventButton } from "../../event/EventButton";
import { DateField } from "../../components/datetime";
import { FieldStack } from "../../auth";
import { ProductTypeArrayField } from "../../product_type/components";

export const ServiceProvidingGroupGridSuspensionShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  const isHistory = resource.endsWith("_history");

  const EditButton = () => {
    const record = useRecordContext()!;
    return (
      <Button
        component={Link}
        to={`/service_providing_group/${record.service_providing_group_id}/grid_suspension/${record.id}`}
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
          "service_providing_group_grid_suspension.update",
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
              source="impact_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeArrayField
              label="Product types"
              source="product_type_ids"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Grid suspension process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="reson" />
            <DateField source="recorded_at" showTime />
            <DateField source="recorded_by" showTime />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton />}
        <NestedResourceHistoryButton
          parent="service_providing_group"
          child="grid_suspension"
          label="grid suspension"
        />
      </SimpleShowLayout>
    </Show>
  );
};
