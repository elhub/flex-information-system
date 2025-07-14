import {
  Button,
  CreateButton,
  ExportButton,
  List,
  SelectArrayInput,
  TextField,
  TopToolbar,
  usePermissions,
} from "react-admin";
import { AutocompleteReferenceInput, Datagrid } from "../auth";
import { Link } from "react-router-dom";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

const EntityLookupButton = () => (
  <Button
    component={Link}
    to="/entity/lookup"
    startIcon={<TravelExploreIcon />}
    label="Lookup an entity"
  />
);

export const EntityList = () => {
  const { permissions } = usePermissions();

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

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("entity.lookup") && <EntityLookupButton />}
      {permissions.includes("entity.create") && <CreateButton />}
      <ExportButton />
    </TopToolbar>
  );

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={entityFilters}
      actions={<ListActions />}
    >
      <Datagrid>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="type" />
        <TextField source="business_id" label="Business ID" />
        <TextField source="business_id_type" label="Business ID type" />
      </Datagrid>
    </List>
  );
};
