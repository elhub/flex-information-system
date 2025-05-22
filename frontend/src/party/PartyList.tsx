import { List, ReferenceField, SelectArrayInput, TextField } from "react-admin";
import {
  AutocompleteReferenceInput,
  Datagrid,
  PartyReferenceInput,
} from "../auth";
import { DateField } from "../components/datetime";

export const PartyList = () => {
  const partyFilters = [
    <AutocompleteReferenceInput
      key="entity_id"
      source="entity_id"
      reference="entity"
      alwaysOn
    />,
    <PartyReferenceInput
      key="id"
      source="id"
      label="Name"
      reference="party"
      noTypeFilter
      alwaysOn
    />,
    <SelectArrayInput
      key="type"
      label="Party type"
      source="type@in"
      choices={[
        { id: "balance_responsible_party", name: "Balance Responsible Party" },
        { id: "end_user", name: "End User" },
        { id: "energy_supplier", name: "Energy Supplier" },
        {
          id: "flexibility_information_system_operator",
          name: "Flexibility Information System Operator",
        },
        { id: "market_operator", name: "Market Operator" },
        { id: "service_provider", name: "Service Provider" },
        { id: "system_operator", name: "System Operator" },
        { id: "third_party", name: "Third Party" },
      ]}
      alwaysOn
    />,
    <SelectArrayInput
      key="status"
      label="Status"
      source="status@in"
      choices={["new", "active", "inactive", "suspended", "terminated"]}
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={partyFilters}
    >
      <Datagrid>
        <TextField source="id" label="ID" />
        <TextField source="business_id" label="Business ID" />
        <ReferenceField source="entity_id" reference="entity">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="name" />
        <TextField source="type" />
        <TextField source="role" />
        <TextField source="status" />
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
