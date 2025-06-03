import {
  List,
  ReferenceField,
  ResourceContextProvider,
  SortPayload,
  TextField,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import { DateField } from "../../components/datetime";

export const ControllableUnitEnergySupplierList = () => {
  // accounting point id of the controllable unit whose ESs we want to get
  const { accounting_point_id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const sort: SortPayload = { field: "valid_from", order: "ASC" };
  const filter = { accounting_point_id: accounting_point_id };

  return (
    permissions.includes("accounting_point_energy_supplier.read") && (
      <ResourceContextProvider value="accounting_point_energy_supplier">
        <List
          title={false}
          perPage={10}
          exporter={false}
          empty={false}
          filter={filter}
          sort={sort}
        >
          <Datagrid bulkActionButtons={false}>
            <ReferenceField source="energy_supplier_id" reference="party">
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
