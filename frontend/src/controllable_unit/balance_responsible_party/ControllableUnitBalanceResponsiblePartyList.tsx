import { useGetOne, usePermissions } from "ra-core";
import { ResourceContextProvider } from "ra-core";
import { useParams } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { List, Datagrid } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { Loader } from "../../components/ui";
import { ControllableUnit } from "../../generated-client";

export const ControllableUnitBalanceResponsiblePartyList = () => {
  const { controllable_unit_id } = useParams<{
    controllable_unit_id: string;
  }>();
  const { data: cu, isLoading } = useGetOne<ControllableUnit & { id: number }>(
    "controllable_unit",
    { id: Number(controllable_unit_id) },
    { enabled: !!controllable_unit_id },
  );

  const { permissions } = usePermissions<Permissions>();
  const canRead = permissions?.allow(
    "accounting_point_balance_responsible_party",
    "read",
  );

  if (isLoading) {
    return <Loader />;
  }

  if (!canRead) {
    return null;
  }

  return (
    <ResourceContextProvider value="accounting_point_balance_responsible_party">
      <List
        perPage={10}
        empty={false}
        filter={
          cu ? { accounting_point_id: cu.accounting_point_id } : undefined
        }
        sort={{ field: "valid_from", order: "ASC" }}
        disableSyncWithLocation
      >
        <Datagrid>
          <ReferenceField
            source="balance_responsible_party_id"
            reference="party"
            label="field.accounting_point_balance_responsible_party.balance_responsible_party_id"
          >
            <TextField source="name" />
          </ReferenceField>
          <EnumField
            source="energy_direction"
            enumKey="accounting_point_balance_responsible_party.energy_direction"
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
  );
};
