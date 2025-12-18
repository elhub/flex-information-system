import { List, TextField } from "react-admin";
import { AutocompleteReferenceInput, Datagrid } from "../auth";
import { EnumArrayInput, EnumField } from "../components/enum";

export const EntityList = () => {
  const entityFilters = [
    <EnumArrayInput
      key="type"
      label="Type"
      source="type@in"
      enumKey="entity.type"
      alwaysOn
    />,
    <AutocompleteReferenceInput
      key="id"
      source="id"
      reference="entity"
      label="Name"
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={entityFilters}
    >
      <Datagrid>
        <TextField source="id" label="field.entity.id" />
        <TextField source="name" label="field.entity.name" />
        <EnumField
          source="type"
          label="field.entity.type"
          enumKey="entity.type"
        />
        <TextField source="business_id" label="field.entity.business_id" />
        <EnumField
          source="business_id_type"
          label="field.entity.business_id_type"
          enumKey="entity.business_id_type"
        />
      </Datagrid>
    </List>
  );
};
