import { useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { TextInput } from "../../components/EDS-ra/inputs";
import {
  zServiceProvidingGroupProductSuspension,
  zServiceProvidingGroupProductSuspensionHistory,
} from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

export const ServiceProvidingGroupProductSuspensionHistoryList = () => {
  const { service_providing_group_id } = useParams();

  const fields = getFields(zServiceProvidingGroupProductSuspension.shape);
  const historyFields = getFields(
    zServiceProvidingGroupProductSuspensionHistory.shape,
  );

  return (
    <List
      resource="service_providing_group_product_suspension_history"
      filter={{ service_providing_group_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
      filters={[
        <TextInput
          key="service_providing_group_product_suspension_id"
          type="number"
          {...historyFields.service_providing_group_product_suspension_id}
        />,
      ]}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField
          {...historyFields.service_providing_group_product_suspension_id}
        />
        <ReferenceField
          {...fields.service_providing_group_id}
          reference="service_providing_group"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          {...fields.procuring_system_operator_id}
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          {...fields.reason}
          enumKey="service_providing_group_product_suspension.reason"
        />
        <DateField {...fields.recorded_at} showTime />
        <IdentityField {...fields.recorded_by} />
        <DateField {...historyFields.replaced_at} showTime />
        <IdentityField {...historyFields.replaced_by} />
      </Datagrid>
    </List>
  );
};
