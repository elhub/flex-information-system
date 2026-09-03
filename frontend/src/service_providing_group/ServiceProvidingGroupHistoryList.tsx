import { useParams } from "react-router-dom";
import { Datagrid } from "../components/EDS-ra/list/Datagrid";
import { List } from "../components/EDS-ra/list/List";
import { DateField } from "../components/EDS-ra/fields/DateField";
import { EnumField } from "../components/EDS-ra/fields/EnumField";
import { ReferenceField } from "../components/EDS-ra/fields/ReferenceField";
import { TextField } from "../components/EDS-ra/fields/TextField";
import {
  zServiceProvidingGroup,
  zServiceProvidingGroupHistory,
} from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const ServiceProvidingGroupHistoryList = () => {
  const { service_providing_group_id } = useParams();

  const spgFields = getFields(zServiceProvidingGroup.shape);
  const historyFields = getFields(zServiceProvidingGroupHistory.shape);

  return (
    <List
      resource="service_providing_group_history"
      filter={{ service_providing_group_id: service_providing_group_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...spgFields.id} />
        <TextField {...historyFields.service_providing_group_id} />
        <TextField {...spgFields.name} />
        <ReferenceField {...spgFields.service_provider_id} reference="party">
          <TextField {...spgFields.name} />
        </ReferenceField>
        <EnumField
          {...spgFields.bidding_zone}
          enumKey="service_providing_group.bidding_zone"
        />
        <EnumField
          {...spgFields.status}
          enumKey="service_providing_group.status"
        />
        <DateField {...spgFields.recorded_at} showTime />
        <DateField {...historyFields.replaced_at} showTime />
      </Datagrid>
    </List>
  );
};
