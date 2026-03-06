import { Link } from "react-router-dom";
import { useGetIdentity, usePermissions } from "ra-core";
import { ExportButton } from "react-admin";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import { EnumArrayInput } from "../components/EDS-ra/inputs";
import { Button } from "../components/ui";
import { Permissions } from "../auth/permissions";
import { zControllableUnit } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { IconPlus } from "@elhub/ds-icons";

const CULookupButton = () => (
  <Button
    as={Link}
    icon={IconPlus}
    to="/controllable_unit/lookup"
    variant="invisible"
  >
    Create
  </Button>
);

const CreateButton = () => (
  <Button
    as={Link}
    icon={IconPlus}
    to="/controllable_unit/create"
    variant="invisible"
  >
    Create manually
  </Button>
);

export const ControllableUnitList = () => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const canLookup = permissions?.allow("controllable_unit", "lookup");
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";

  const controllableUnitFilters = [
    <EnumArrayInput
      key="status"
      source="status@in"
      enumKey="controllable_unit.status"
    />,
  ];

  const fields = getFields(zControllableUnit.shape);

  const actions = [
    ...(canLookup ? [<CULookupButton key="lookup" />] : []),
    ...(isFiso ? [<CreateButton key="create" />] : []),
    <ExportButton key="export" />,
  ];

  return (
    <List
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={controllableUnitFilters}
      actions={actions}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.business_id.source} />
        <TextField source={fields.name.source} />
        <DateField source={fields.start_date.source} />
        <EnumField
          source={fields.status.source}
          enumKey="controllable_unit.status"
        />
        <EnumField
          source={fields.regulation_direction.source}
          enumKey="controllable_unit.regulation_direction"
        />
        <TextField source={fields.is_small.source} />
        <ReferenceField
          source={fields.accounting_point_id.source}
          reference="accounting_point"
        >
          <TextField source="business_id" />
        </ReferenceField>
        <TextField source={fields.grid_node_id.source} />
        <EnumField
          source={fields.grid_validation_status.source}
          enumKey="controllable_unit.grid_validation_status"
        />
        <DateField source={fields.recorded_at.source} showTime />
      </Datagrid>
    </List>
  );
};
