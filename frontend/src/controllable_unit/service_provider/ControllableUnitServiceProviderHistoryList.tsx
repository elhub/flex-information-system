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

export const ControllableUnitServiceProviderHistoryList = () => {
  const params = useParams();
  let filter: any = {
    controllable_unit_id: params.controllable_unit_id,
  };

  const { data } = useGetOne("controllable_unit", {
    id: params.controllable_unit_id,
  });

  const ControllableUnitServiceProviderHistoryListFilters = [
    <NumberInput
      key="controllable_unit_service_provider_id"
      min="0"
      label="Controllable Unit Service Provider ID"
      source="controllable_unit_service_provider_id"
    />,
  ];

  return (
    <List
      resource="controllable_unit_service_provider_history"
      title={`Controllable unit service provider history for ${data.name}`}
      filter={filter}
      filters={ControllableUnitServiceProviderHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/controllable_unit/${record.controllable_unit_id}/service_provider_history/${record.id}/show`
        }
      >
        <TextField source="id" label="ID" />
        <TextField source="controllable_unit_service_provider_id" />
        <ReferenceField source="service_provider_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="contract_reference" />
        <DateField source="valid_from" showTime />
        <DateField source="valid_to" showTime />
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <IdentityField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
