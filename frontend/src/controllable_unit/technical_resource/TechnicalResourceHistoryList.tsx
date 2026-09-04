import { useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { TextInput } from "../../components/EDS-ra/inputs";
import {
  zTechnicalResource,
  zTechnicalResourceHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

export const TechnicalResourceHistoryList = () => {
  const { controllable_unit_id } = useParams();

  const fields = getFields(zTechnicalResource.shape);
  const historyFields = getFields(zTechnicalResourceHistory.shape);

  return (
    <List
      resource="technical_resource_history"
      filter={{ controllable_unit_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
      filters={[
        <TextInput
          key="technical_resource_id"
          type="number"
          {...historyFields.technical_resource_id}
        />,
      ]}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.technical_resource_id} />
        <TextField {...fields.name} />
        <ReferenceField
          {...fields.controllable_unit_id}
          reference="controllable_unit"
        >
          <TextField source="name" />
        </ReferenceField>
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
