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
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { permissionRefs } from "../../auth/permissions";

const CreateButton = ({ id }: { id: any }) => {
  let createUrl = "/service_providing_group_membership/create";
  if (id) createUrl = `/service_providing_group/${id}/membership/create`;

  return (
    <Button
      component={Link}
      to={createUrl}
      startIcon={<AddIcon />}
      state={{ service_providing_group_id: id }}
      label="Create"
    />
  );
};

const ListActions = ({
  permissions,
  id,
}: {
  permissions: string[];
  id: any;
}) => {
  const canCreate = permissions.includes(
    permissionRefs.service_providing_group_membership.create,
  );

  return <TopToolbar>{canCreate && <CreateButton id={id} />}</TopToolbar>;
};

export const ServiceProvidingGroupMembershipList = () => {
  // id of the SPG
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions();

  // Permission checks
  const canRead = permissions.includes(
    permissionRefs.service_providing_group_membership.read,
  );
  const canDelete = permissions.includes(
    permissionRefs.service_providing_group_membership.delete,
  );

  return (
    canRead && (
      <ResourceContextProvider value="service_providing_group_membership">
        <List
          title={false}
          perPage={10}
          actions={<ListActions permissions={permissions} id={id} />}
          exporter={false}
          empty={false}
          filter={
            id
              ? { service_providing_group_id: id, "valid_from@not.is": null }
              : { "valid_from@not.is": null }
          }
          sort={{ field: "valid_from", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/service_providing_group/${record.service_providing_group_id}/membership/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            {!record?.id && (
              <ReferenceField
                source="service_providing_group_id"
                reference="service_providing_group"
                sortable={false}
              >
                <TextField source="name" />
              </ReferenceField>
            )}
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
            <DateField source="valid_from" showTime />
            <DateField source="valid_to" showTime />
            {canDelete && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
