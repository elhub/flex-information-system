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

export const TechnicalResourceList = () => {
  // id of the controllable unit whose technical resources we want to get
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  // automatically fill the controllable_unit_id field with the ID of the
  // show page the create button is displayed on
  const CreateButton = () => (
    <Button
      component={Link}
      to={`/controllable_unit/${id}/technical_resource/create`}
      startIcon={<AddIcon />}
      state={{ controllable_unit_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("technical_resource.create") && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes("technical_resource.read") && (
      <ResourceContextProvider value="technical_resource">
        <List
          title={false}
          perPage={10}
          actions={<ListActions />}
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
            {permissions.includes("technical_resource.delete") && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
