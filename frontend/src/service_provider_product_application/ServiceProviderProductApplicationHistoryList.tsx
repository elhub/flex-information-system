import { useParams } from "react-router-dom";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import {
  zServiceProviderProductApplication,
  zServiceProviderProductApplicationHistory,
} from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const ServiceProviderProductApplicationHistoryList = () => {
  const { service_provider_product_application_id } = useParams();

  const fields = getFields(zServiceProviderProductApplication.shape);
  const historyFields = getFields(
    zServiceProviderProductApplicationHistory.shape,
  );

  return (
    <List
      resource="service_provider_product_application_history"
      filter={{ service_provider_product_application_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...historyFields.service_provider_product_application_id} />
        <ReferenceField {...fields.service_provider_id} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField {...fields.system_operator_id} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          {...fields.status}
          enumKey="service_provider_product_application.status"
        />
        <DateField {...fields.qualified_at} showTime />
        <DateField {...fields.recorded_at} showTime />
        <DateField {...historyFields.replaced_at} showTime />
      </Datagrid>
    </List>
  );
};
