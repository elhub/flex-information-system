import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import {
  zServiceProviderProductApplication,
  zServiceProviderProductApplicationHistory,
} from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { ProductTypeArrayField } from "../components/ProductTypeArrayField";
import { FunctionField } from "react-admin";
import { useTranslateField } from "../intl/intl";

export const ServiceProviderProductApplicationHistoryList = ({
  sppaId,
}: {
  sppaId: number;
}) => {
  const t = useTranslateField();

  const fields = getFields(zServiceProviderProductApplication.shape);
  const historyFields = getFields(
    zServiceProviderProductApplicationHistory.shape,
  );

  return (
    <List
      resource="service_provider_product_application_history"
      filter={{ service_provider_product_application_id: sppaId }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <ReferenceField
          {...fields.service_provider_id}
          reference="party"
          label={t(
            "service_provider_product_application_history.service_provider_id",
          )}
          hideLabel={true}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          {...fields.system_operator_id}
          reference="party"
          label={t(
            "service_provider_product_application_history.system_operator_id",
          )}
          hideLabel={true}
        >
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          source="product_type_ids"
          sortable={false}
          render={(record: { product_type_ids: number[] }) => (
            <ProductTypeArrayField productTypeIds={record.product_type_ids} />
          )}
        />
        <EnumField
          {...fields.status}
          enumKey="service_provider_product_application.status"
        />
        <DateField {...fields.qualified_at} showTime />
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
