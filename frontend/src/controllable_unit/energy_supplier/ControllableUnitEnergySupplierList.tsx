import {
  usePermissions,
  useRecordContext,
  ResourceContextProvider,
} from "ra-core";
import { Permissions } from "../../auth/permissions";
import { List, Datagrid } from "../../components/EDS-ra/list";
import {
  DateField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";

export const ControllableUnitEnergySupplierList = () => {
  const { accounting_point_id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();
  const canRead = permissions?.allow(
    "accounting_point_energy_supplier",
    "read",
  );

  return (
    canRead && (
      <ResourceContextProvider value="accounting_point_energy_supplier">
        <List
          perPage={10}
          empty={false}
          filter={{ accounting_point_id: accounting_point_id }}
          sort={{ field: "valid_from", order: "ASC" }}
          disableSyncWithLocation
        >
          <Datagrid>
            <ReferenceField
              source="energy_supplier_id"
              reference="party"
              label="field.accounting_point_energy_supplier.energy_supplier_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <DateField
              source="valid_from"
              showTime
              label="field.accounting_point_energy_supplier.valid_from"
            />
            <DateField
              source="valid_to"
              showTime
              label="field.accounting_point_energy_supplier.valid_to"
            />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
