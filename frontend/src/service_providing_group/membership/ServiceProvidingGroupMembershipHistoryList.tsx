import {
  List,
  NumberInput,
  ReferenceField,
  TextField,
  useGetOne,
} from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../datetime";
import { IdentityField } from "../../IdentityField";

export const ServiceProvidingGroupMembershipHistoryList = () => {
  const params = useParams();
  var filter: any = {
    service_providing_group_id: params.service_providing_group_id,
  };

  const { data } = useGetOne("service_providing_group", {
    id: params.service_providing_group_id,
  });

  const ServiceProvidingGroupMembershipHistoryListFilters = [
    <NumberInput
      key="service_providing_group_membership_id"
      min="0"
      label="Service Providing Group Membership ID"
      source="service_providing_group_membership_id"
    />,
  ];

  return (
    <List
      resource="service_providing_group_membership_history"
      title={`Service providing group membership history for ${data.name}`}
      filter={filter}
      filters={ServiceProvidingGroupMembershipHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/service_providing_group/${record.service_providing_group_id}/membership_history/${record.id}/show`
        }
      >
        <TextField source="id" />
        <TextField source="service_providing_group_membership_id" />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="service_providing_group_id"
          reference="service_providing_group"
        >
          <TextField source="name" />
        </ReferenceField>
        <DateField source="valid_from" showTime />
        <DateField source="valid_to" showTime />
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <IdentityField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
