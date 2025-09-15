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

export const ServiceProvidingGroupGridPrequalificationList = () => {
  // id of the SPG (present only when this page is a subresource of SPG)
  const record = useRecordContext()!;
  const id = record?.id;
  const { permissions } = usePermissions();

  const CreateButton = () => (
    <Button
      component={Link}
      to={
        id
          ? `/service_providing_group/${id}/grid_prequalification/create`
          : "/service_providing_group_grid_prequalification/create"
      }
      startIcon={<AddIcon />}
      state={{ service_providing_group_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes(
        "service_providing_group_grid_prequalification.create",
      ) && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes(
      "service_providing_group_grid_prequalification.read",
    ) && (
      <ResourceContextProvider value="service_providing_group_grid_prequalification">
        <List
          title={false}
          perPage={10}
          actions={<ListActions />}
          exporter={false}
          empty={false}
          filter={id ? { service_providing_group_id: id } : undefined}
          sort={{ field: "id", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `/service_providing_group/${record.service_providing_group_id}/grid_prequalification/${record.id}/show`
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
              source="impacted_system_operator_id"
              reference="party"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="status" />
            <DateField source="prequalified_at" showTime />
            {permissions.includes(
              "service_providing_group_grid_prequalification.delete",
            ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
