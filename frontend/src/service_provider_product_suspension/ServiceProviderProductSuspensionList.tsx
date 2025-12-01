import {
  DeleteButton,
  List,
  ReferenceField,
  SelectArrayInput,
  TextField,
  usePermissions,
} from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";
import { ProductTypeArrayField } from "../product_type/components";
import { IdentityField } from "../components/IdentityField";
import { permissionRefs } from "../auth/permissions";

export const ServiceProviderProductSuspensionList = () => {
  const { permissions } = usePermissions();

  // Permission checks
  const canDelete = permissions.includes(
    permissionRefs.service_provider_product_suspension.delete,
  );

  const ServiceProviderProductSuspensionListFilters = [
    <PartyReferenceInput
      key="procuring_system_operator_id"
      source="procuring_system_operator_id"
      alwaysOn
    />,
    <PartyReferenceInput
      key="service_provider_id"
      source="service_provider_id"
      alwaysOn
    />,
    <SelectArrayInput
      key="reason"
      label="Reason"
      source="reason@in"
      choices={[
        "communication_issues",
        "failing_heartbeat",
        "system_issues",
        "clearing_issues",
        "breach_of_conditions",
        "other",
      ]}
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={ServiceProviderProductSuspensionListFilters}
    >
      <Datagrid bulkActionButtons={false} rowClick="show">
        <TextField source="id" label="ID" />
        <ReferenceField
          source="procuring_system_operator_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeArrayField
          label="Product types"
          source="product_type_ids"
        />
        <TextField source="reason" />
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
        {canDelete && <DeleteButton mutationMode="pessimistic" redirect="" />}
      </Datagrid>
    </List>
  );
};
