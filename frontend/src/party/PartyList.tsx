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
import { zParty } from "../generated-client/zod.gen";
import { getFields } from "../util";
import { CreateButton } from "../components/EDS-ra";

export const PartyList = () => {
  const partyFilters = [
    <AutocompleteReferenceInput
      key="entity_id"
      source="entity_id"
      reference="entity"
    />,
    <PartyReferenceInput
      key="id"
      overrideLabel="Party"
      noTypeFilter
      source="id"
    />,
    <EnumArrayInput key="type" source="type@in" enumKey="party.type" />,
    <EnumArrayInput key="status" source="status@in" enumKey="party.status" />,
  ];

  const partyFields = getFields(zParty.shape);

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={partyFilters}
      actions={[<CreateButton key="create" />]}
    >
      <Datagrid>
        <TextField source={partyFields.id.source} />
        <TextField source={partyFields.business_id.source} />
        <ReferenceField
          source={partyFields.entity_id.source}
          reference="entity"
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source={partyFields.name.source} />
        <EnumField source={partyFields.type.source} enumKey="party.type" />
        <TextField source={partyFields.role.source} />
        <EnumField source={partyFields.status.source} enumKey="party.status" />
        <DateField source={partyFields.recorded_at.source} showTime />
      </Datagrid>
    </List>
  );
};
