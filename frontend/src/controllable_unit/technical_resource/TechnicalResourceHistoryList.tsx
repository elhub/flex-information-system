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

export const TechnicalResourceHistoryList = () => {
  const params = useParams();
  const filter: any = {
    controllable_unit_id: params.controllable_unit_id,
  };

  const { data } = useGetOne("controllable_unit", {
    id: params.controllable_unit_id,
  });

  const TechnicalResourceHistoryListFilters = [
    <NumberInput
      key="technical_resource_id"
      min="0"
      label="field.technical_resource_history.technical_resource_id"
      source="technical_resource_id"
    />,
  ];

  return (
    <List
      resource="technical_resource_history"
      title={`Technical resource history for ${data.name}`}
      filter={filter}
      filters={TechnicalResourceHistoryListFilters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `/controllable_unit/${record.controllable_unit_id}/technical_resource_history/${record.id}/show`
        }
      >
        <TextField source="id" label="field.technical_resource_history.id" />
        <TextField
          source="technical_resource_id"
          label="field.technical_resource_history.technical_resource_id"
        />
        <TextField
          source="name"
          label="field.technical_resource_history.name"
        />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
          sortable={false}
          label="field.technical_resource_history.controllable_unit_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <DateField
          source="recorded_at"
          showTime
          label="field.technical_resource_history.recorded_at"
        />
        <IdentityField
          source="recorded_by"
          label="field.technical_resource_history.recorded_by"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.technical_resource_history.replaced_at"
        />
        <IdentityField
          source="replaced_by"
          label="field.technical_resource_history.replaced_by"
        />
      </Datagrid>
    </List>
  );
};
