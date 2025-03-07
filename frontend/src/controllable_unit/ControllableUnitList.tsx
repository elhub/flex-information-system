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
    // used to be able to input a CU ID instead of picking from the known CUs
    state={{ fromCUList: true }}
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
      <CULookupButton />
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
