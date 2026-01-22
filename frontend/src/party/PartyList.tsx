import {
  AutocompleteReferenceInput,
  EnumArrayInput,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";

export const PartyList = () => {
  const partyFilters = [
    <AutocompleteReferenceInput
      key="entity_id"
      source="entity_id"
      reference="entity"
      label="Entity"
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
        <TextField source="id" />
        <TextField source="business_id" />
        <ReferenceField source="entity_id" reference="entity">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="name" />
        <EnumField source="type" enumKey="party.type" />
        <TextField source="role" />
        <EnumField source="status" enumKey="party.status" />
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
