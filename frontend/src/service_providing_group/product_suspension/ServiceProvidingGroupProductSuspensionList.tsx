import {
  List,
  Button,
  DeleteButton,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation } from "react-router-dom";
import { ProductTypeArrayField } from "../../product_type/components";
import { Permissions } from "../../auth/permissions";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { EnumField } from "../../components/enum";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    component={Link}
    to={
      id
        ? `/service_providing_group/${id}/product_suspension/create`
        : "/service_providing_group_product_suspension/create"
    }
    startIcon={<AddIcon />}
    state={{ service_providing_group_id: id }}
    label="Create"
  />
);

const ListActions = ({
  permissions,
  id,
}: {
  permissions: Permissions | undefined;
  id: any;
}) => {
  const canCreate = permissions?.allow(
    "service_providing_group_product_suspension",
    "create",
  );

  return <TopToolbar>{canCreate && <CreateButton id={id} />}</TopToolbar>;
};

export const ServiceProvidingGroupProductSuspensionList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow(
    "service_providing_group_product_suspension",
    "read",
  );
  const canDelete = permissions?.allow(
    "service_providing_group_product_suspension",
    "delete",
  );

  // are we in flat URL mode or nested
  const isURLFlat = useLocation().pathname.includes(
    "service_providing_group_product_suspension",
  );

  return (
    canRead && (
      <ResourceContextProvider value="service_providing_group_product_suspension">
        <List
          title={false}
          perPage={10}
          actions={<ListActions permissions={permissions} id={id} />}
          exporter={false}
          empty={false}
          filter={id ? { service_providing_group_id: id } : undefined}
          sort={{ field: "id", order: "DESC" }}
          sx={{ mb: 4 }}
          disableSyncWithLocation
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/service_providing_group/${record.service_providing_group_id}/product_suspension/${record.id}/show`
            }
          >
            <TextField
              source="id"
              label="field.service_providing_group_product_suspension.id"
            />
            {(!record?.id || isURLFlat) && (
              <ReferenceField
                source="service_providing_group_id"
                reference="service_providing_group"
                sortable={false}
                label="field.service_providing_group_product_suspension.service_providing_group_id"
              >
                <TextField source="name" />
              </ReferenceField>
            )}
            <ReferenceField
              source="procuring_system_operator_id"
              reference="party"
              sortable={false}
              label="field.service_providing_group_product_suspension.procuring_system_operator_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeArrayField label="field.service_providing_group_product_suspension.product_type_ids" />
            <EnumField
              source="reason"
              enumKey="service_providing_group_product_suspension.reason"
              label="field.service_providing_group_product_suspension.reason"
            />
            {isURLFlat && (
              <DateField
                source="recorded_at"
                showTime
                label="field.service_providing_group_product_suspension.recorded_at"
              />
            )}
            {isURLFlat && (
              <IdentityField
                source="recorded_by"
                label="field.service_providing_group_product_suspension.recorded_by"
              />
            )}
            {canDelete && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
