import { useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { TextInput } from "../../components/EDS-ra/inputs";
import {
  zServiceProvidingGroupMembership,
  zServiceProvidingGroupMembershipHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

export const ServiceProvidingGroupMembershipHistoryList = () => {
  const { service_providing_group_id } = useParams();

  const fields = getFields(zServiceProvidingGroupMembership.shape);
  const historyFields = getFields(
    zServiceProvidingGroupMembershipHistory.shape,
  );

  return (
    <List
      resource="service_providing_group_membership_history"
      filter={{ service_providing_group_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
      filters={[
        <TextInput
          key="service_providing_group_membership_id"
          type="number"
          {...historyFields.service_providing_group_membership_id}
        />,
      ]}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.service_providing_group_membership_id} />
        <ReferenceField
          {...fields.controllable_unit_id}
          reference="controllable_unit"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          {...fields.service_providing_group_id}
          reference="service_providing_group"
        >
          <TextField source="name" />
        </ReferenceField>
        <DateField {...fields.valid_from} showTime />
        <DateField {...fields.valid_to} showTime />
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
