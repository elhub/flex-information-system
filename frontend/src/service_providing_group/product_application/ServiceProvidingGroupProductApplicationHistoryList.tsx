import {
  FunctionField,
  List,
  NumberInput,
  ReferenceField,
  TextField,
  useGetOne,
  useTranslateLabel,
} from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../datetime";

export const ServiceProvidingGroupProductApplicationHistoryList = () => {
  const params = useParams();
  var filter: any = {
    service_providing_group_id: params.service_providing_group_id,
  };

  const { data } = useGetOne("service_providing_group", {
    id: params.service_providing_group_id,
  });

  const translateLabel = useTranslateLabel();

  const ServiceProvidingGroupProductApplicationHistoryListFilters = [
    <NumberInput
      key="service_providing_group_product_application_id"
      min="0"
      label="Service Providing Group product_application ID"
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
        <TextField source="id" label="ID" />
        <TextField source="service_provider_product_application_id" />
        <ReferenceField source="procuring_system_operator_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="product_type_id" reference="product_type">
          <FunctionField
            source="business_id"
            render={(record) => translateLabel({ source: record.business_id })}
          />
        </ReferenceField>
        <TextField source="status" />
        <DateField source="last_prequalified" showTime />
        <DateField source="last_verified" showTime />
        <DateField source="recorded_at" showTime />
        <TextField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <TextField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
