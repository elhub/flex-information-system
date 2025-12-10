import {
  List,
  Loading,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  useGetOne,
  usePermissions,
} from "react-admin";
import { Datagrid } from "../../auth";
import { DateField } from "../../components/datetime";
import { Permissions } from "../../auth/permissions";
import { ControllableUnit } from "../../generated-client";
import { useParams } from "react-router-dom";

export const ControllableUnitBalanceResponsiblePartyList = () => {
  // accounting point id of the controllable unit whose BRPs we want to get
  const { controllable_unit_id } = useParams<{
    controllable_unit_id: string;
  }>();
  const { data: cu, isLoading } = useGetOne<ControllableUnit & { id: number }>(
    "controllable_unit",
    { id: Number(controllable_unit_id) },
    { enabled: !!controllable_unit_id },
  );

  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow(
    "accounting_point_balance_responsible_party",
    "read",
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!canRead) {
    return null;
  }

  return (
    canRead && (
      <ResourceContextProvider value="accounting_point_balance_responsible_party">
        <List
          title={false}
          perPage={10}
          exporter={false}
          empty={false}
          filter={
            cu ? { accounting_point_id: cu.accounting_point_id } : undefined
          }
          sort={{ field: "valid_from", order: "ASC" }}
          disableSyncWithLocation
        >
          <Datagrid bulkActionButtons={false}>
            <ReferenceField
              source="balance_responsible_party_id"
              reference="party"
              sortable={false}
              label="field.accounting_point_balance_responsible_party.balance_responsible_party_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField
              source="energy_direction"
              label="field.accounting_point_balance_responsible_party.energy_direction"
            />
            <DateField
              source="valid_from"
              showTime
              label="field.accounting_point_balance_responsible_party.valid_from"
            />
            <DateField
              source="valid_to"
              showTime
              label="field.accounting_point_balance_responsible_party.valid_to"
            />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
