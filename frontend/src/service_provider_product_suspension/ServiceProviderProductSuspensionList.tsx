import { usePermissions } from "ra-core";
import { List, Datagrid } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import { DeleteButton } from "../components/EDS-ra/buttons";
import { EnumArrayInput, PartyReferenceInput } from "../components/EDS-ra/inputs";
import { ProductTypeArrayField } from "../product_type/components";
import { Permissions } from "../auth/permissions";
import { zServiceProviderProductSuspension } from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const ServiceProviderProductSuspensionList = () => {
  const { permissions } = usePermissions<Permissions>();
  const canDelete = permissions?.allow("service_provider_product_suspension", "delete");
  const fields = getFields(zServiceProviderProductSuspension.shape);

  const filters = [
    <PartyReferenceInput
      key="procuring_system_operator_id"
      source="procuring_system_operator_id"
      filter={{ type: "system_operator" }}
    />,
    <PartyReferenceInput
      key="service_provider_id"
      source="service_provider_id"
    />,
    <EnumArrayInput
      key="reason"
      enumKey="service_provider_product_suspension.reason"
      source="reason@in"
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={filters}
    >
      <Datagrid rowClick={(r) => `/service_provider_product_suspension/${r.id}/show`}>
        <TextField source={fields.id.source} />
        <ReferenceField source={fields.procuring_system_operator_id.source} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source={fields.service_provider_id.source} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeArrayField source={fields.product_type_ids.source} />
        <EnumField
          source={fields.reason.source}
          enumKey="service_provider_product_suspension.reason"
        />
        <DateField source={fields.recorded_at.source} showTime />
        <IdentityField source={fields.recorded_by.source} />
        {canDelete && <DeleteButton />}
      </Datagrid>
    </List>
  );
};
