import { List, NumberInput, TextField } from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../DateField";
import { IdentityField } from "../../IdentityField";

export const ServiceProviderProductApplicationCommentHistoryList = () => {
  const { service_provider_product_application_id } = useParams();

  const ServiceProviderProductApplicationCommentHistoryListFilters = [
    <NumberInput
      key="service_provider_product_application_comment_id"
      min="0"
      label="Service Provider Product Application Comment ID"
      source="service_provider_product_application_comment_id"
    />,
  ];

  return (
    <List
      resource="service_provider_product_application_comment_history"
      title={`Comment history for Service provider product application ${service_provider_product_application_id}`}
      filter={{
        service_provider_product_application_id:
          service_provider_product_application_id,
      }}
      filters={ServiceProviderProductApplicationCommentHistoryListFilters}
      perPage={25}
      sort={{ field: "created_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/service_provider_product_application/${record.service_provider_product_application_id}/comment_history/${record.id}/show`
        }
      >
        <TextField source="id" label="ID" />
        <TextField source="visibility" />
        <IdentityField source="created_by" />
        <TextField source="content" />
        <DateField source="recorded_at" showTime />
        <TextField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <TextField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
