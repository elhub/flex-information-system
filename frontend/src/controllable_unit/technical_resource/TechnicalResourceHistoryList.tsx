import {
  List,
  NumberInput,
  ReferenceField,
  TextField,
  useGetOne,
} from "react-admin";
import { Datagrid } from "../../auth";
import { useParams } from "react-router-dom";
import { DateField } from "../../datetime";

export const TechnicalResourceHistoryList = () => {
  const params = useParams();
  var filter: any = {
    controllable_unit_id: params.controllable_unit_id,
  };

  const { data } = useGetOne("controllable_unit", {
    id: params.controllable_unit_id,
  });

  const TechnicalResourceHistoryListFilters = [
    <NumberInput
      key="technical_resource_id"
      min="0"
      label="Technical Resource ID"
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
        <TextField source="id" label="ID" />
        <TextField
          source="technical_resource_id"
          label="Technical resource ID"
        />
        <TextField source="name" />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
        >
          <TextField source="name" />
        </ReferenceField>
        <DateField source="recorded_at" showTime />
        <TextField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <TextField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
