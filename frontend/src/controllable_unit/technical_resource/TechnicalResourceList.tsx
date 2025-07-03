import {
  List,
  Button,
  DeleteButton,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  useGetList,
  usePermissions,
  useRecordContext,
  SortPayload,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { useState } from "react";

export const TechnicalResourceList = () => {
  // id of the controllable unit whose technical resources we want to get
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const [sort, setSort] = useState<SortPayload>({ field: "id", order: "DESC" });
  const { data, isLoading } = useGetList("technical_resource", {
    filter: { controllable_unit_id: id },
    sort,
  });

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
          sort={sort}
        >
          <Datagrid
            bulkActionButtons={false}
            data={data}
            sort={sort}
            setSort={setSort}
            isLoading={isLoading}
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
