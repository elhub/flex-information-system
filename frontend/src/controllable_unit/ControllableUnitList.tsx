import {
  List,
  Button,
  BooleanField,
  ReferenceField,
  TextField,
  ExportButton,
  CreateButton,
  usePermissions,
  TopToolbar,
} from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../components/datetime";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { Permissions } from "../auth/permissions";
import { EnumArrayInput, EnumField } from "../components/enum";

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
    to="/controllable_unit/lookup"
    startIcon={<TravelExploreIcon />}
    label="Lookup a controllable unit"
  />
);

const ListActions = () => {
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canLookup = permissions?.allow("controllable_unit", "lookup");
  const canCreateCUSP = permissions?.allow(
    "controllable_unit_service_provider",
    "create",
  );
  const canCreate = permissions?.allow("controllable_unit", "create");

  return (
    <TopToolbar>
      {canLookup && <CULookupButton />}
      {canCreateCUSP && <CreateCUSPButton />}
      {canCreate && <CreateButton />}
      <ExportButton />
    </TopToolbar>
  );
};

export const ControllableUnitList = () => {
  const controllableUnitFilters = [
    <EnumArrayInput
      key="status"
      label="Status"
      source="status@in"
      enumKey="controllable_unit.status"
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={controllableUnitFilters}
      actions={<ListActions />}
    >
      <Datagrid>
        <TextField source="id" label="field.controllable_unit.id" />
        <TextField
          source="business_id"
          label="field.controllable_unit.business_id"
        />
        <TextField source="name" label="field.controllable_unit.name" />
        <DateField
          source="start_date"
          label="field.controllable_unit.start_date"
        />
        <EnumField
          source="status"
          label="field.controllable_unit.status"
          enumKey="controllable_unit.status"
        />
        <EnumField
          source="regulation_direction"
          label="field.controllable_unit.regulation_direction"
          enumKey="controllable_unit.regulation_direction"
        />
        <BooleanField
          source="is_small"
          label="field.controllable_unit.is_small"
        />
        <ReferenceField
          source="accounting_point_id"
          reference="accounting_point"
          label="field.controllable_unit.accounting_point_id"
        >
          <TextField source="business_id" />
        </ReferenceField>
        <TextField
          source="grid_node_id"
          label="field.controllable_unit.grid_node_id"
        />
        <EnumField
          source="grid_validation_status"
          label="field.controllable_unit.grid_validation_status"
          enumKey="controllable_unit.grid_validation_status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.controllable_unit.recorded_at"
        />
      </Datagrid>
    </List>
  );
};
