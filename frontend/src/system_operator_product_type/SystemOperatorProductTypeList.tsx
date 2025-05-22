import {
  FunctionField,
  List,
  ReferenceField,
  SelectArrayInput,
  TextField,
  useGetList,
  useTranslateLabel,
} from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";
import { QuickFilter } from "../components/QuickFilter";

export const SystemOperatorProductTypeList = () => {
  const translateLabel = useTranslateLabel();

  const { data } = useGetList("product_type");
  const productTypes = data?.map((product_type) => {
    return {
      id: product_type.id,
      name: translateLabel({ source: product_type.business_id }),
    };
  });
  productTypes?.sort((pt1, pt2) => pt1.id - pt2.id);

  const SystemOperatorProductTypeListFilters = [
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
      alwaysOn
    />,
    <SelectArrayInput
      key="product_type_id"
      label="Product type"
      source="product_type_id@in"
      choices={productTypes}
      alwaysOn
    />,
    <QuickFilter
      key="status"
      source="status"
      label="Active only"
      defaultValue="active"
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={SystemOperatorProductTypeListFilters}
    >
      <Datagrid>
        <TextField source="id" />
        <ReferenceField source="system_operator_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="product_type_id" reference="product_type">
          <FunctionField
            render={(record) => translateLabel({ source: record.business_id })}
          />
        </ReferenceField>
        <TextField source="status" />
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
