import { useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import {
  zParty,
  zServiceProvidingGroupProductApplication,
  zServiceProvidingGroupProductApplicationHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";
import { ProductTypeArrayField } from "../../components/ProductTypeArrayField";
import { FunctionField } from "react-admin";

export const ServiceProvidingGroupProductApplicationHistoryList = () => {
  const { service_providing_group_product_application_id } = useParams();

  const spgpaFields = getFields(zServiceProvidingGroupProductApplication.shape);
  const historyFields = getFields(
    zServiceProvidingGroupProductApplicationHistory.shape,
  );
  const procuringSystemOperatorIdFields = getFields(zParty.shape);

  return (
    <List
      resource="service_providing_group_product_application_history"
      filter={{ service_providing_group_product_application_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...spgpaFields.id} />
        <ReferenceField
          {...spgpaFields.procuring_system_operator_id}
          reference="party"
        >
          <TextField {...procuringSystemOperatorIdFields.name} />
        </ReferenceField>
        <FunctionField
          source="product_type_ids"
          sortable={false}
          render={(record: { product_type_ids: number[] }) => (
            <ProductTypeArrayField productTypeIds={record.product_type_ids} />
          )}
        />
        <EnumField
          {...spgpaFields.status}
          enumKey="service_providing_group_product_application.status"
        />
        <DateField {...spgpaFields.prequalified_at} showTime />
        <DateField {...spgpaFields.verified_at} showTime />
        <DateField {...spgpaFields.recorded_at} showTime />
        <IdentityField {...spgpaFields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
