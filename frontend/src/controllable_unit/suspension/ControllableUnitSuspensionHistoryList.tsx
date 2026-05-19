import { useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { TextInput } from "../../components/EDS-ra/inputs";
import {
  zControllableUnitSuspension,
  zControllableUnitSuspensionHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

export const ControllableUnitSuspensionHistoryList = () => {
  const { controllable_unit_id } = useParams();

  const fields = getFields(zControllableUnitSuspension.shape);
  const historyFields = getFields(zControllableUnitSuspensionHistory.shape);

  return (
    <List
      resource="controllable_unit_suspension_history"
      filter={{ controllable_unit_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
      filters={[
        <TextInput
          key="controllable_unit_suspension_id"
          type="number"
          {...historyFields.controllable_unit_suspension_id}
        />,
      ]}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <ReferenceField
          {...fields.controllable_unit_id}
          reference="controllable_unit"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          {...fields.impacted_system_operator_id}
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          {...fields.reason}
          enumKey="controllable_unit_suspension.reason"
        />
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
