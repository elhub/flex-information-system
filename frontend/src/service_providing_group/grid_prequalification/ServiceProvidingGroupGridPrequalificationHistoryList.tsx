import { useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import {
  zServiceProvidingGroupGridPrequalification,
  zServiceProvidingGroupGridPrequalificationHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

export const ServiceProvidingGroupGridPrequalificationHistoryList = () => {
  const { service_providing_group_grid_prequalification_id } = useParams();

  const fields = getFields(zServiceProvidingGroupGridPrequalification.shape);
  const historyFields = getFields(
    zServiceProvidingGroupGridPrequalificationHistory.shape,
  );

  return (
    <List
      resource="service_providing_group_grid_prequalification_history"
      filter={{ service_providing_group_grid_prequalification_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField
          {...historyFields.service_providing_group_grid_prequalification_id}
        />
        <ReferenceField
          {...fields.service_providing_group_id}
          reference="service_providing_group"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          {...fields.impacted_system_operator_id}
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          {...fields.status}
          enumKey="service_providing_group_grid_prequalification.status"
        />
        <DateField {...fields.prequalified_at} showTime />
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
