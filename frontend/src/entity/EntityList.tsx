import { List, SelectArrayInput, TextField } from "react-admin";
import { AutocompleteReferenceInput, Datagrid } from "../auth";

export const EntityList = () => {
  const entityFilters = [
    <SelectArrayInput
      key="type"
      label="Type"
      source="type@in"
      choices={["organisation", "person"]}
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
        <TextField source="type" label="field.entity.type" />
        <TextField source="business_id" label="field.entity.business_id" />
        <TextField
          source="business_id_type"
          label="field.entity.business_id_type"
        />
      </Datagrid>
    </List>
  );
};
