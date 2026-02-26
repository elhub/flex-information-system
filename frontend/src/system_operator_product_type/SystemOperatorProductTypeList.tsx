import {
  Datagrid,
  DateField,
  EnumField,
  List,
  ReferenceField,
  TextField,
} from "../components/EDS-ra";
import {
  EnumArrayInput,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { zSystemOperatorProductType } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import {
  ProductTypeArrayInput,
  ProductTypeField,
} from "../product_type/components";
import { usePermissions } from "ra-core";
import { Permissions } from "../auth/permissions";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { IconPlus } from "@elhub/ds-icons";

const CreateButton = () => (
  <Button
    as={Link}
    icon={IconPlus}
    to="/system_operator_product_type/create"
    variant="invisible"
  >
    Create
  </Button>
);

export const SystemOperatorProductTypeList = () => {
  const fields = getFields(zSystemOperatorProductType.shape);
  const { permissions } = usePermissions<Permissions>();
  const canCreate = permissions?.allow(
    "system_operator_product_type",
    "create",
  );

  const filters = [
    <PartyReferenceInput
      key="system_operator_id"
      source={fields.system_operator_id.source}
    />,
    <ProductTypeArrayInput key="product_type_id" source="product_type_id@in" />,
    <EnumArrayInput
      key="status"
      source="status@in"
      enumKey="system_operator_product_type.status"
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={filters}
      actions={canCreate ? [<CreateButton key="create" />] : undefined}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <ReferenceField
          source={fields.system_operator_id.source}
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeField source={fields.product_type_id.source} />
        <EnumField
          source={fields.status.source}
          enumKey="system_operator_product_type.status"
        />
        <DateField source={fields.recorded_at.source} showTime />
      </Datagrid>
    </List>
  );
};
