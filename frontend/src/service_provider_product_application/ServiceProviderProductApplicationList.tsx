import { List, ReferenceField, SelectArrayInput, TextField } from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";

export const ServiceProviderProductApplicationList = () => {
  const ServiceProviderProductApplicationListFilters = [
    <PartyReferenceInput
      key="service_provider_id"
      source="service_provider_id"
      alwaysOn
    />,
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
      alwaysOn
    />,
    <SelectArrayInput
      key="status"
      label="Status"
      source="status@in"
      choices={[
        "requested",
        "in_progress",
        "communication_test",
        "not_qualified",
        "qualified",
      ]}
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={ServiceProviderProductApplicationListFilters}
    >
      <Datagrid>
        <TextField source="id" label="ID" />
        <ReferenceField source="service_provider_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="system_operator_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="status" />
        <DateField source="last_qualified" showTime />
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
