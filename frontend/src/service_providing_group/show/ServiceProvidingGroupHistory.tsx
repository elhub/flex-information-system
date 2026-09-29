import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/index";
import {
  zServiceProvidingGroup,
  zServiceProvidingGroupHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupHistoryList = ({ spgId }: Props) => {
  const spgFields = getFields(zServiceProvidingGroup.shape);
  const historyFields = getFields(zServiceProvidingGroupHistory.shape);
  return (
    <List
      resource="service_providing_group_history"
      filter={{ service_providing_group_id: spgId }}
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
