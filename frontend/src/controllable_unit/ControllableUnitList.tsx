import {
  List,
  Button,
  BooleanField,
  ReferenceField,
  TextField,
  SelectArrayInput,
  ExportButton,
  CreateButton,
  usePermissions,
  TopToolbar,
  useGetIdentity,
} from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../datetime";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

const CreateCUSPButton = () => (
  <Button
    component={Link}
    to={`/controllable_unit_service_provider/create`}
    startIcon={<AddIcon />}
    // input a CU ID instead of from a list of names (cf. CUSP input)
    state={{ cuIDAsNumber: true }}
    label="Manage another controllable unit"
  />
);

const CULookupButton = () => (
  <Button
    component={Link}
    to="/controllable_unit_lookup"
    startIcon={<TravelExploreIcon />}
    label="Lookup a controllable unit"
  />
);

export const ControllableUnitList = () => {
  const { permissions } = usePermissions();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isSPOrFISO =
    identity?.role == "flex_service_provider" ||
    identity?.role == "flex_flexibility_information_system_operator";

  const controllableUnitFilters = [
    <SelectArrayInput
      key="status"
      label="Status"
      source="status@in"
      choices={["new", "active", "suspended", "terminated"]}
      alwaysOn
    />,
  ];

  const ListActions = () => (
    <TopToolbar>
      {isSPOrFISO && <CULookupButton />}
      {permissions.includes("controllable_unit_service_provider.create") && (
        <CreateCUSPButton />
      )}
      {permissions.includes("controllable_unit.create") && <CreateButton />}
      <ExportButton />
    </TopToolbar>
  );

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={controllableUnitFilters}
      actions={<ListActions />}
    >
      <Datagrid>
        <TextField source="id" label="ID" />
        <TextField source="business_id" label="Business ID" />
        <TextField source="name" />
        <DateField source="start_date" />
        <TextField source="status" />
        <TextField source="regulation_direction" />
        <BooleanField source="is_small" />
        <TextField source="accounting_point_id" />
        <TextField source="grid_node_id" />
        <ReferenceField
          source="connecting_system_operator_id"
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="grid_validation_status" />
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
