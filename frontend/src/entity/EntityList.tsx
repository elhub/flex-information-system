import { Datagrid } from "../components/EDS-ra/list/Datagrid";
import { List } from "../components/EDS-ra/list/List";
import { EnumField } from "../components/EDS-ra/fields/EnumField";
import { TextField } from "../components/EDS-ra/fields/TextField";
import { AutocompleteReferenceInput } from "../components/EDS-ra/inputs/AutocompleteReferenceInput";
import { EnumArrayInput } from "../components/EDS-ra/inputs/EnumArrayInput";
import { zEntity } from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const EntityList = () => {
  const fields = getFields(zEntity.shape);

  const entityFilters = [
    <EnumArrayInput key="type" source="type@in" enumKey="entity.type" />,
    <AutocompleteReferenceInput key="id" source="id" reference="entity" />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={entityFilters}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.name.source} />
        <EnumField source={fields.type.source} enumKey="entity.type" />
        <TextField source={fields.business_id.source} />
        <EnumField
          source={fields.business_id_type.source}
          enumKey="entity.business_id_type"
        />
      </Datagrid>
    </List>
  );
};
