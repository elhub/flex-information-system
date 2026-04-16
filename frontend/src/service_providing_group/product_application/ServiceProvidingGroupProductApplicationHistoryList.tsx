import { useTypedParams, buildPath } from "../../routes";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { TextInput } from "../../components/EDS-ra/inputs";
import { ProductTypeArrayField } from "../../product_type/components";
import { ListServiceProvidingGroupProductApplicationHistoryData } from "../../generated-client";
import { getFields } from "../../zod";
import {
  zParty,
  zServiceProvidingGroupProductApplication,
  zServiceProvidingGroupProductApplicationHistory,
} from "../../generated-client/zod.gen";

export const ServiceProvidingGroupProductApplicationHistoryList = () => {
  const params = useTypedParams("spg_product_application_history");
  const filter: ListServiceProvidingGroupProductApplicationHistoryData["query"] =
    {
      service_providing_group_id: params.service_providing_group_id,
    };

  const filters = [
    <TextInput
      key="service_providing_group_product_application_id"
      type="number"
      source="service_providing_group_product_application_id"
    />,
  ];
  const spgpaFields = getFields(zServiceProvidingGroupProductApplication.shape);
  // Since history is an intersection of spgpa and a few other fields, we need to get the fields for the right side of the intersection.
  const historyFields = getFields(
    zServiceProvidingGroupProductApplicationHistory._zod.def.right.shape,
  );
  const procuringSystemOperatorIdFields = getFields(zParty.shape);

  return (
    <List
      resource="service_providing_group_product_application_history"
      filter={filter}
      filters={filters}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(record) =>
          buildPath("spg_product_application_history_show", {
            service_providing_group_id: String(
              record.service_providing_group_id,
            ),
            id: String(record.id),
          })
        }
      >
        <TextField {...spgpaFields.id} />
        <ReferenceField
          {...spgpaFields.procuring_system_operator_id}
          reference="party"
        >
          <TextField {...procuringSystemOperatorIdFields.name} />
        </ReferenceField>
        <ProductTypeArrayField source="product_type_ids" sortable={false} />
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
