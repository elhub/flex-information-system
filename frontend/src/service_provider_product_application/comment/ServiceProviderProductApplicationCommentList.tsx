import {
  List,
  Button,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
  RichTextField,
  useGetList,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { DateField } from "../../datetime";
import { IdentityField } from "../../IdentityField";
import { CircularProgress } from "@mui/material";

export const ServiceProviderProductApplicationCommentList = () => {
  // id of the SPPA
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions();

  const { data, isLoading } = useGetList(
    "service_provider_product_application_comment",
    { filter: { service_provider_product_application_id: id } },
  );

  if (isLoading) return <CircularProgress size={25} thickness={2} />;

  const CreateButton = () => (
    <Button
      component={Link}
      to={`/service_provider_product_application/${id}/comment/create`}
      startIcon={<AddIcon />}
      state={{ service_provider_product_application_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes(
        "service_provider_product_application_comment.create",
      ) && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes(
      "service_provider_product_application_comment.read",
    ) && (
      <ResourceContextProvider value="service_provider_product_application_comment">
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
            sort={{ field: "created_at", order: "ASC" }}
            rowClick={(_id, _res, record) =>
              `/service_provider_product_application/${record.service_provider_product_application_id}/comment/${record.id}/show`
            }
          >
            <TextField source="id" label="Comment ID" />
            <DateField source="created_at" showTime />
            <DateField source="recorded_at" label="Last updated" showTime />
            <IdentityField source="created_by" />
            <TextField source="visibility" />
            <RichTextField source="content" />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
