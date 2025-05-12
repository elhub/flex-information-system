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
import { DateField } from "../../datetime";

export const ControllableUnitBalanceResponsiblePartyList = () => {
  // accounting point id of the controllable unit whose BRPs we want to get
  const { accounting_point_id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const sort: SortPayload = { field: "valid_from", order: "ASC" };
  const filter = { accounting_point_id: accounting_point_id };

  return (
    permissions.includes("accounting_point_balance_responsible_party.read") && (
      <ResourceContextProvider value="accounting_point_balance_responsible_party">
        <List
          title={false}
          perPage={10}
          exporter={false}
          empty={false}
          filter={filter}
        >
          <Datagrid bulkActionButtons={false} sort={sort}>
            <TextField source="id" label="ID" />
            <ReferenceField
              source="balance_responsible_party_id"
              reference="party"
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
