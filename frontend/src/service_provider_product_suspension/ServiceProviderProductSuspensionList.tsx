import {
  DeleteButton,
  List,
  ReferenceField,
  SelectArrayInput,
  TextField,
  usePermissions,
} from "react-admin";
import { Permissions } from "../auth/permissions";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";
import { ProductTypeArrayField } from "../product_type/components";
import { IdentityField } from "../components/IdentityField";

export const ServiceProviderProductSuspensionList = () => {
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canDelete = permissions?.allow(
    "service_provider_product_suspension",
    "delete",
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
        <TextField
          source="id"
          label="field.service_provider_product_suspension.id"
        />
        <ReferenceField
          source="procuring_system_operator_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_suspension.procuring_system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_suspension.service_provider_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeArrayField
          label="Product types"
          source="product_type_ids"
        />
        <TextField
          source="reason"
          label="field.service_provider_product_suspension.reason"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.service_provider_product_suspension.recorded_at"
        />
        <IdentityField
          source="recorded_by"
          label="field.service_provider_product_suspension.recorded_by"
        />
        {canDelete && <DeleteButton mutationMode="pessimistic" redirect="" />}
      </Datagrid>
    </List>
  );
};
