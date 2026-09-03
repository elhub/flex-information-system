import { AutocompleteReferenceInput } from "../components/EDS-ra/inputs/AutocompleteReferenceInput";
import { EnumArrayInput } from "../components/EDS-ra/inputs/EnumArrayInput";
import { PartyReferenceInput } from "../components/EDS-ra/inputs/PartyReferenceInput";
import { Datagrid } from "../components/EDS-ra/list/Datagrid";
import { List } from "../components/EDS-ra/list/List";
import { EnumField } from "../components/EDS-ra/fields/EnumField";
import { ReferenceField } from "../components/EDS-ra/fields/ReferenceField";
import { StatusBadgeField } from "../components/EDS-ra/fields/StatusBadgeField";
import { TextField } from "../components/EDS-ra/fields/TextField";
import { partyStatusVariantMap } from "./partyStatus";
import { zParty } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { CreateButton } from "../components/EDS-ra/buttons/CreateButton";
import { usePermissions } from "ra-core";
import { Permissions } from "../auth/permissions";

export const PartyList = () => {
  const partyFilters = [
    <AutocompleteReferenceInput
      key="entity_id"
      source="entity_id"
      reference="entity"
      inputClassName="w-[18rem]"
    />,
    <PartyReferenceInput
      key="id"
      overrideLabel="Party"
      noTypeFilter
      source="id"
      inputClassName="w-[26rem]"
    />,
    <EnumArrayInput
      key="type"
      source="type@in"
      enumKey="party.type"
      inputClassName="w-[15rem]"
    />,
    <EnumArrayInput key="status" source="status@in" enumKey="party.status" />,
  ];

  const partyFields = getFields(zParty.shape);
  const { permissions } = usePermissions<Permissions>();
  const canCreate = permissions?.allow("party", "create");

  return (
    <List
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={partyFilters}
      actions={canCreate ? [<CreateButton key="create" />] : []}
    >
      <Datagrid>
        <TextField source={partyFields.id.source} />
        <ReferenceField
          source={partyFields.entity_id.source}
          reference="entity"
          label="resources.party.fields.entity_id"
          hideLabel
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source={partyFields.name.source} hideLabel />
        <EnumField source={partyFields.type.source} enumKey="party.type" />
        <TextField source={partyFields.role.source} />
        <StatusBadgeField
          source={partyFields.status.source}
          enumKey="party.status"
          variantMap={partyStatusVariantMap}
        />
      </Datagrid>
    </List>
  );
};
