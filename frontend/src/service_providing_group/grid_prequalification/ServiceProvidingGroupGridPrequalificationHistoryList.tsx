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
import { EnumField } from "../../components/enum";

export const ServiceProvidingGroupGridPrequalificationHistoryList = () => {
  const params = useParams();
  let filter: any = {
    service_providing_group_id: params.service_providing_group_id,
  };

  const { data } = useGetOne("service_providing_group", {
    id: params.service_providing_group_id,
  });

  const ServiceProvidingGroupGridPrequalificationHistoryListFilters = [
    <NumberInput
      key="service_providing_group_grid_prequalification_id"
      min="0"
      label="Service Providing Group Grid Prequalification ID"
      source="service_providing_group_grid_prequalification_id"
    />,
  ];

  return (
    <List
      resource="service_providing_group_grid_prequalification_history"
      title={`Service providing group grid prequalification history for ${data.name}`}
      filter={filter}
      filters={ServiceProvidingGroupGridPrequalificationHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/service_providing_group/${record.service_providing_group_id}/grid_prequalification_history/${record.id}/show`
        }
      >
        <TextField
          source="id"
          label="field.service_providing_group_grid_prequalification_history.id"
        />
        <TextField
          source="service_providing_group_grid_prequalification_id"
          label="field.service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id"
        />
        <ReferenceField
          source="service_providing_group_id"
          reference="service_providing_group"
          sortable={false}
          label="field.service_providing_group_grid_prequalification_history.service_providing_group_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="impacted_system_operator_id"
          reference="party"
          sortable={false}
          label="field.service_providing_group_grid_prequalification_history.impacted_system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          source="status"
          enumKey="service_providing_group_grid_prequalification.status"
          label="field.service_providing_group_grid_prequalification_history.status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.service_providing_group_grid_prequalification_history.recorded_at"
        />
        <IdentityField
          source="recorded_by"
          label="field.service_providing_group_grid_prequalification_history.recorded_by"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.service_providing_group_grid_prequalification_history.replaced_at"
        />
        <IdentityField
          source="replaced_by"
          label="field.service_providing_group_grid_prequalification_history.replaced_by"
        />
      </Datagrid>
    </List>
  );
};
