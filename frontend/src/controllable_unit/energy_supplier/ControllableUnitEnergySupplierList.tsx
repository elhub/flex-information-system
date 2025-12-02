import {
  List,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import { DateField } from "../../components/datetime";
import { Permissions } from "../../auth/permissions";

export const ControllableUnitEnergySupplierList = () => {
  // accounting point id of the controllable unit whose ESs we want to get
  const { accounting_point_id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow(
    "accounting_point_energy_supplier",
    "read",
  );

  return (
    canRead && (
      <ResourceContextProvider value="accounting_point_energy_supplier">
        <List
          title={false}
          perPage={10}
          exporter={false}
          empty={false}
          filter={{ accounting_point_id: accounting_point_id }}
          sort={{ field: "valid_from", order: "ASC" }}
          disableSyncWithLocation
        >
          <Datagrid bulkActionButtons={false}>
            <ReferenceField
              source="energy_supplier_id"
              reference="party"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
            <DateField source="valid_from" showTime />
            <DateField source="valid_to" showTime />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
