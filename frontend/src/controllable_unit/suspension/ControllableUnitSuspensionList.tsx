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
import { Permissions } from "../../auth/permissions";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    component={Link}
    to={
      id
        ? `/controllable_unit/${id}/suspension/create`
        : "/controllable_unit/suspension/create"
    }
    startIcon={<AddIcon />}
    state={{ controllable_unit_id: id }}
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
    "controllable_unit_suspension",
    "create",
  );

  return <TopToolbar>{canCreate && <CreateButton id={id} />}</TopToolbar>;
};

export const ControllableUnitSuspensionList = () => {
  // id of the CU (present only when this page is a subresource of CU)
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow("controllable_unit_suspension", "read");
  const canDelete = permissions?.allow(
    "controllable_unit_suspension",
    "delete",
  );

  return (
    canRead && (
      <ResourceContextProvider value="controllable_unit_suspension">
        <List
          title={false}
          perPage={10}
          actions={<ListActions permissions={permissions} id={id} />}
          exporter={false}
          empty={false}
          filter={id ? { controllable_unit_id: id } : undefined}
          sort={{ field: "id", order: "DESC" }}
          sx={{ mb: 4 }}
          // disable read/writes to/from the URL by this component
          // (necessary on pages with several List components,
          // i.e., in our case, subresources)
          // see https://github.com/marmelab/react-admin/pull/5741
          disableSyncWithLocation
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/controllable_unit/${record.controllable_unit_id}/suspension/${record.id}/show`
            }
          >
            <ReferenceField
              source="impacted_system_operator_id"
              reference="party"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="reason" />
            {canDelete && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
