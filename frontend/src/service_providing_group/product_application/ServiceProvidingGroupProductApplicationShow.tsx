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
import { IdentityField } from "../../components/IdentityField";
import { ProductTypeArrayField } from "../../product_type/components";
import { Permissions } from "../../auth/permissions";

export const ServiceProvidingGroupProductApplicationShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );

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

  return (
    <Show
      actions={
        !isHistory &&
        canUpdate && (
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
            <ProductTypeArrayField
              label="Product types"
              source="product_type_ids"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Application process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="status" />
            <TextField source="notes" />
            <DateField source="prequalified_at" showTime />
            <DateField source="verified_at" showTime />
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
          child="product_application"
          label="product applications"
        />
      </SimpleShowLayout>
    </Show>
  );
};
