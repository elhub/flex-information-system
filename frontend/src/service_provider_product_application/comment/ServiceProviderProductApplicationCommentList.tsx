import {
  List,
  Button,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
  RichTextField,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";

export const ServiceProviderProductApplicationCommentList = () => {
  // id of the SPPA
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions();

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
          filter={{ service_provider_product_application_id: id }}
          sort={{ field: "created_at", order: "ASC" }}
        >
          <Datagrid
            bulkActionButtons={false}
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
