import {
  List,
  NumberInput,
  ReferenceField,
  TextField,
  useGetOne,
} from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { ProductTypeArrayField } from "../../product_type/components";
import { EnumField } from "../../components/enum";

export const ServiceProvidingGroupProductApplicationHistoryList = () => {
  const params = useParams();
  let filter: any = {
    service_providing_group_id: params.service_providing_group_id,
  };

  const { data } = useGetOne("service_providing_group", {
    id: params.service_providing_group_id,
  });

  const ServiceProvidingGroupProductApplicationHistoryListFilters = [
    <NumberInput
      key="service_providing_group_product_application_id"
      min="0"
      label="field.service_providing_group_product_application_history.service_providing_group_product_application_id"
      source="service_providing_group_product_application_id"
    />,
  ];

  return (
    <List
      resource="service_providing_group_product_application_history"
      title={`Service providing group product application history for ${data.name}`}
      filter={filter}
      filters={ServiceProvidingGroupProductApplicationHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/service_providing_group/${record.service_providing_group_id}/product_application_history/${record.id}/show`
        }
      >
        <TextField
          source="id"
          label="field.service_providing_group_product_application_history.id"
        />
        <TextField
          source="service_provider_product_application_id"
          label="field.service_providing_group_product_application_history.service_provider_product_application_id"
        />
        <ReferenceField
          source="procuring_system_operator_id"
          reference="party"
          sortable={false}
          label="field.service_providing_group_product_application_history.procuring_system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeArrayField
          label="field.service_providing_group_product_application_history.product_type_ids"
          source="product_type_ids"
          sortable={false}
        />
        <EnumField
          source="status"
          enumKey="service_providing_group_product_application.status"
          label="field.service_providing_group_product_application_history.status"
        />
        <DateField
          source="prequalified_at"
          showTime
          label="field.service_providing_group_product_application_history.prequalified_at"
        />
        <DateField
          source="verified_at"
          showTime
          label="field.service_providing_group_product_application_history.verified_at"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.service_providing_group_product_application_history.recorded_at"
        />
        <IdentityField
          source="recorded_by"
          label="field.service_providing_group_product_application_history.recorded_by"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.service_providing_group_product_application_history.replaced_at"
        />
        <IdentityField
          source="replaced_by"
          label="field.service_providing_group_product_application_history.replaced_by"
        />
      </Datagrid>
    </List>
  );
};
