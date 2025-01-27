import {
  List,
  Button,
  DeleteButton,
  ReferenceField,
  ResourceContextProvider,
  SortPayload,
  TextField,
  TopToolbar,
  useGetList,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { DateField } from "../../DateField";

export const ControllableUnitServiceProviderList = () => {
  // id of the controllable unit whose relations we want to get
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const sort: SortPayload = { field: "valid_from", order: "DESC" };
  const { data, isLoading } = useGetList("controllable_unit_service_provider", {
    filter: { controllable_unit_id: id, "valid_from@not.is": null },
    sort,
  });

  // automatically fill the controllable_unit_id field with the ID of the
  // show page the create button is displayed on
  const CreateButton = () => (
    <Button
      component={Link}
      to={`/controllable_unit/${id}/service_provider/create`}
      startIcon={<AddIcon />}
      state={{ controllable_unit_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("controllable_unit_service_provider.create") && (
        <CreateButton />
      )}
    </TopToolbar>
  );

  return (
    permissions.includes("controllable_unit_service_provider.read") && (
      // resource context update here,
      // so the fields in the datagrid refer to controllable_unit_service_provider
      // records even though this component is on the controllable_unit show page
      <ResourceContextProvider value="controllable_unit_service_provider">
        <List
          title={false}
          perPage={10}
          actions={<ListActions />}
          exporter={false}
          empty={false}
        >
          <Datagrid
            bulkActionButtons={false}
            data={data}
            isLoading={isLoading}
            sort={sort}
            rowClick={(_id, _res, record) =>
              `/controllable_unit/${record.controllable_unit_id}/service_provider/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            <ReferenceField source="service_provider_id" reference="party">
              <TextField source="name" />
            </ReferenceField>
            <DateField source="valid_from" showTime />
            <DateField source="valid_to" showTime />

            {permissions.includes(
              "controllable_unit_service_provider.delete",
            ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
