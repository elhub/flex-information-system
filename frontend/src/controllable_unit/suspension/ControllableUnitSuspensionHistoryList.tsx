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

export const ControllableUnitSuspensionHistoryList = () => {
  const params = useParams();
  let filter: any = {
    controllable_unit_id: params.controllable_unit_id,
  };

  const { data } = useGetOne("controllable_unit", {
    id: params.controllable_unit_id,
  });

  const ControllableUnitSuspensionHistoryListFilters = [
    <NumberInput
      key="controllable_unit_suspension_id"
      min="0"
      label="Controllable Unit Suspension ID"
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
        <TextField source="id" label="ID" />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="impacted_system_operator_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="reason" />
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
      </Datagrid>
    </List>
  );
};
