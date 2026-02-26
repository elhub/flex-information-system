import {
  List,
  NumberInput,
  ReferenceField,
  TextField,
  useGetOne,
} from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { EnumField } from "../../components/enum";

export const ControllableUnitSuspensionHistoryList = () => {
  const params = useParams();
  const filter: any = {
    controllable_unit_id: params.controllable_unit_id,
  };

  const { data } = useGetOne("controllable_unit", {
    id: params.controllable_unit_id,
  });

  const ControllableUnitSuspensionHistoryListFilters = [
    <NumberInput
      key="controllable_unit_suspension_id"
      min="0"
      label="field.controllable_unit_suspension_history.controllable_unit_suspension_id"
      source="controllable_unit_suspension_id"
    />,
  ];

  return (
    <List
      resource="controllable_unit_suspension_history"
      title={`Controllable unit suspension history for ${data?.name ?? ""}`}
      filter={filter}
      filters={ControllableUnitSuspensionHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/controllable_unit/${record.controllable_unit_id}/suspension_history/${record.id}/show`
        }
      >
        <TextField
          source="id"
          label="field.controllable_unit_suspension_history.id"
        />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
          sortable={false}
          label="field.controllable_unit_suspension_history.controllable_unit_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="impacted_system_operator_id"
          reference="party"
          sortable={false}
          label="field.controllable_unit_suspension_history.impacted_system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          source="reason"
          label="field.controllable_unit_suspension_history.reason"
          enumKey="controllable_unit_suspension.reason"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.controllable_unit_suspension_history.recorded_at"
        />
        <IdentityField
          source="recorded_by"
          label="field.controllable_unit_suspension_history.recorded_by"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.controllable_unit_suspension_history.replaced_at"
        />
        <IdentityField
          source="replaced_by"
          label="field.controllable_unit_suspension_history.replaced_by"
        />
      </Datagrid>
    </List>
  );
};
