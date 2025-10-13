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

export const ServiceProvidingGroupGridSuspensionHistoryList = () => {
  const params = useParams();
  let filter: any = {
    service_providing_group_id: params.service_providing_group_id,
  };

  const { data } = useGetOne("service_providing_group", {
    id: params.service_providing_group_id,
  });

  const ServiceProvidingGroupGridSuspensionHistoryListFilters = [
    <NumberInput
      key="service_providing_group_grid_suspension_id"
      min="0"
      label="Service Providing Group Grid Suspension ID"
      source="service_providing_group_grid_suspension_id"
    />,
  ];

  return (
    <List
      resource="service_providing_group_grid_suspension_history"
      title={`Service providing group grid suspension history for ${data.name}`}
      filter={filter}
      filters={ServiceProvidingGroupGridSuspensionHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/service_providing_group/${record.service_providing_group_id}/grid_suspension_history/${record.id}/show`
        }
      >
        <TextField source="id" />
        <TextField source="service_providing_group_grid_suspension_id" />
        <ReferenceField
          source="service_providing_group_id"
          reference="service_providing_group"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="impacted_system_operator_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="reason" />
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <IdentityField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
