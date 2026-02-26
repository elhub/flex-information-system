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
  const filter: any = {
    controllable_unit_id: params.controllable_unit_id,
  };

  const { data } = useGetOne("controllable_unit", {
    id: params.controllable_unit_id,
  });

  const ControllableUnitServiceProviderHistoryListFilters = [
    <NumberInput
      key="controllable_unit_service_provider_id"
      min="0"
      label="field.controllable_unit_service_provider_history.controllable_unit_service_provider_id"
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
        <TextField
          source="id"
          label="field.controllable_unit_service_provider_history.id"
        />
        <TextField
          source="controllable_unit_service_provider_id"
          label="field.controllable_unit_service_provider_history.controllable_unit_service_provider_id"
        />
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
          label="field.controllable_unit_service_provider_history.service_provider_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField
          source="contract_reference"
          label="field.controllable_unit_service_provider_history.contract_reference"
        />
        <DateField
          source="valid_from"
          showTime
          label="field.controllable_unit_service_provider_history.valid_from"
        />
        <DateField
          source="valid_to"
          showTime
          label="field.controllable_unit_service_provider_history.valid_to"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.controllable_unit_service_provider_history.recorded_at"
        />
        <IdentityField
          source="recorded_by"
          label="field.controllable_unit_service_provider_history.recorded_by"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.controllable_unit_service_provider_history.replaced_at"
        />
        <IdentityField
          source="replaced_by"
          label="field.controllable_unit_service_provider_history.replaced_by"
        />
      </Datagrid>
    </List>
  );
};
