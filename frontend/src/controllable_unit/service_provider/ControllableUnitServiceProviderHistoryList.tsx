import { useParams } from "react-router-dom";
import { Datagrid } from "../../components/EDS-ra/list/Datagrid";
import { List } from "../../components/EDS-ra/list/List";
import { DateField } from "../../components/EDS-ra/fields/DateField";
import { IdentityField } from "../../components/EDS-ra/fields/IdentityField";
import { ReferenceField } from "../../components/EDS-ra/fields/ReferenceField";
import { TextField } from "../../components/EDS-ra/fields/TextField";
import { TextInput } from "../../components/EDS-ra/inputs/TextInput";
import {
  zControllableUnitServiceProvider,
  zControllableUnitServiceProviderHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

export const ControllableUnitServiceProviderHistoryList = () => {
  const { controllable_unit_id } = useParams();

  const fields = getFields(zControllableUnitServiceProvider.shape);
  const historyFields = getFields(
    zControllableUnitServiceProviderHistory.shape,
  );

  return (
    <List
      resource="controllable_unit_service_provider_history"
      filter={{ controllable_unit_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
      filters={[
        <TextInput
          key="controllable_unit_service_provider_id"
          type="number"
          {...historyFields.controllable_unit_service_provider_id}
        />,
      ]}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.controllable_unit_service_provider_id} />
        <ReferenceField {...fields.service_provider_id} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <TextField {...fields.contract_reference} />
        <DateField {...fields.valid_from} showTime />
        <DateField {...fields.valid_to} showTime />
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
