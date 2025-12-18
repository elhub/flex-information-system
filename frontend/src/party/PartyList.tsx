import { List, ReferenceField, TextField } from "react-admin";
import {
  AutocompleteReferenceInput,
  Datagrid,
  PartyReferenceInput,
} from "../auth";
import { DateField } from "../components/datetime";
import { EnumArrayInput, EnumField } from "../components/enum";

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
      noTypeFilter
      alwaysOn
    />,
    <EnumArrayInput
      key="type"
      label="Party type"
      source="type@in"
      enumKey="party.type"
      alwaysOn
    />,
    <EnumArrayInput
      key="status"
      label="Status"
      source="status@in"
      enumKey="party.status"
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
        <TextField source="id" label="field.party.id" />
        <TextField source="business_id" label="field.party.business_id" />
        <ReferenceField
          source="entity_id"
          reference="entity"
          sortable={false}
          label="field.party.entity_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="name" label="field.party.name" />
        <EnumField
          source="type"
          label="field.party.type"
          enumKey="party.type"
        />
        <TextField source="role" label="field.party.role" />
        <EnumField
          source="status"
          label="field.party.status"
          enumKey="party.status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.party.recorded_at"
        />
      </Datagrid>
    </List>
  );
};
