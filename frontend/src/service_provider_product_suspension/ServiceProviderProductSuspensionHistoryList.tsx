import { useParams } from "react-router-dom";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import {
  zServiceProviderProductSuspension,
  zServiceProviderProductSuspensionHistory,
} from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const ServiceProviderProductSuspensionHistoryList = () => {
  const { service_provider_product_suspension_id } = useParams();

  const fields = getFields(zServiceProviderProductSuspension.shape);
  const historyFields = getFields(
    zServiceProviderProductSuspensionHistory.shape,
  );

  return (
    <List
      resource="service_provider_product_suspension_history"
      filter={{ service_provider_product_suspension_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.service_provider_product_suspension_id} />
        <ReferenceField
          {...fields.procuring_system_operator_id}
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField {...fields.service_provider_id} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          {...fields.reason}
          enumKey="service_provider_product_suspension.reason"
        />
        <DateField {...fields.recorded_at} showTime />
        <DateField {...historyFields.replaced_at} showTime />
      </Datagrid>
    </List>
  );
};
