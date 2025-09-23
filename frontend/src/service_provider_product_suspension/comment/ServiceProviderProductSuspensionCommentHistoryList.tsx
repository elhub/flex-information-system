import { List, NumberInput, RichTextField, TextField } from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";

export const ServiceProviderProductSuspensionCommentHistoryList = () => {
  const { service_provider_product_suspension_id } = useParams();

  const ServiceProviderProductSuspensionCommentHistoryListFilters = [
    <NumberInput
      key="service_provider_product_suspension_comment_id"
      min="0"
      label="Service Provider Product Application Comment ID"
      source="service_provider_product_suspension_comment_id"
    />,
  ];

  return (
    <List
      resource="service_provider_product_suspension_comment_history"
      title={`Comment history for Service provider product suspension ${service_provider_product_suspension_id}`}
      filter={{
        service_provider_product_suspension_id:
          service_provider_product_suspension_id,
      }}
      filters={ServiceProviderProductSuspensionCommentHistoryListFilters}
      perPage={25}
      sort={{ field: "created_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/service_provider_product_suspension/${record.service_provider_product_suspension_id}/comment_history/${record.id}/show`
        }
      >
        <TextField source="id" label="ID" />
        <TextField source="visibility" />
        <IdentityField source="created_by" />
        <RichTextField source="content" />
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <IdentityField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
