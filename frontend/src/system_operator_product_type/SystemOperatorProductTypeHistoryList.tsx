import { useParams } from "react-router-dom";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import {
  zSystemOperatorProductType,
  zSystemOperatorProductTypeHistory,
} from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const SystemOperatorProductTypeHistoryList = () => {
  const { system_operator_product_type_id } = useParams();

  const fields = getFields(zSystemOperatorProductType.shape);
  const historyFields = getFields(zSystemOperatorProductTypeHistory.shape);

  return (
    <List
      resource="system_operator_product_type_history"
      filter={{ system_operator_product_type_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.system_operator_product_type_id} />
        <ReferenceField {...fields.system_operator_id} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField {...fields.product_type_id} reference="product_type" />
        <EnumField
          {...fields.status}
          enumKey="system_operator_product_type.status"
        />
        <DateField {...fields.recorded_at} showTime />
        <DateField {...historyFields.replaced_at} showTime />
      </Datagrid>
    </List>
  );
};
