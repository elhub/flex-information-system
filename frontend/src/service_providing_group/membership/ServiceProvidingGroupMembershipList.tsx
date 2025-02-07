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
import { DateField } from "../../datetime";

export const ServiceProvidingGroupMembershipList = () => {
  // id of the SPG
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions();

  const sort: SortPayload = { field: "valid_from", order: "DESC" };
  const { data, isLoading } = useGetList("service_providing_group_membership", {
    filter: id
      ? { service_providing_group_id: id, "valid_from@not.is": null }
      : { "valid_from@not.is": null },
    sort,
  });

  const CreateButton = () => {
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

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("service_providing_group_membership.create") && (
        <CreateButton />
      )}
    </TopToolbar>
  );

  return (
    permissions.includes("service_providing_group_membership.read") && (
      <ResourceContextProvider value="service_providing_group_membership">
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
              `/service_providing_group/${record.service_providing_group_id}/membership/${record.id}/show`
            }
          >
            <TextField source="id" />
            {!record?.id && (
              <ReferenceField
                source="service_providing_group_id"
                reference="service_providing_group"
              >
                <TextField source="name" />
              </ReferenceField>
            )}
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
            >
              <TextField source="name" />
            </ReferenceField>
            <DateField source="valid_from" showTime />
            <DateField source="valid_to" showTime />
            {permissions.includes(
              "service_providing_group_membership.delete",
            ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
