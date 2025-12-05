import {
  List,
  Button,
  DeleteButton,
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

// automatically fill the controllable_unit_id field with the ID of the
// show page the create button is displayed on
const CreateButton = ({ id }: { id: any }) => {
  return (
    <Button
      component={Link}
      to={`/controllable_unit/${id}/technical_resource/create`}
      startIcon={<AddIcon />}
      state={{ controllable_unit_id: id }}
      label="Create"
    />
  );
};

const ListActions = ({
  permissions,
  id,
}: {
  permissions: Permissions | undefined;
  id: any;
}) => {
  const canCreate = permissions?.allow("technical_resource", "create");

  return <TopToolbar>{canCreate && <CreateButton id={id} />}</TopToolbar>;
};

export const TechnicalResourceList = () => {
  // id of the controllable unit whose technical resources we want to get
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow("technical_resource", "read");
  const canDelete = permissions?.allow("technical_resource", "delete");

  return (
    canRead && (
      <ResourceContextProvider value="technical_resource">
        <List
          title={false}
          perPage={10}
          actions={<ListActions permissions={permissions} id={id} />}
          exporter={false}
          empty={false}
          filter={{ controllable_unit_id: id }}
          sort={{ field: "id", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/controllable_unit/${record.controllable_unit_id}/technical_resource/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            <TextField source="name" />
            <TextField source="details" />
            {canDelete && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
