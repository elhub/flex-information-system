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

export const ControllableUnitBalanceResponsiblePartyList = () => {
  // accounting point id of the controllable unit whose BRPs we want to get
  const { accounting_point_id } = useRecordContext()!;
  const { permissions } = usePermissions();

  return (
    permissions.includes("accounting_point_balance_responsible_party.read") && (
      <ResourceContextProvider value="accounting_point_balance_responsible_party">
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
              source="balance_responsible_party_id"
              reference="party"
              sortable={false}
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="energy_direction" />
            <DateField source="valid_from" showTime />
            <DateField source="valid_to" showTime />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
