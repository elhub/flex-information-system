import {
  ArrayField,
  FunctionField,
  ReferenceField,
  SelectArrayInput,
  SelectInput,
  useGetList,
  WithListContext,
} from "react-admin";
import { Stack, Chip } from "@mui/material";

// display a product type with name and example products if present
function displayProductType(productType: any) {
  return (
    productType.name +
    (productType.products ? ` (${productType.products})` : "")
  );
}

// hook to get all possible product types sorted by ID
function useGetAllProductTypes() {
  const { data } = useGetList("product_type");

  const productTypes = data?.map((product_type) => {
    return {
      id: product_type.id,
      name: displayProductType(product_type),
    };
  });
  productTypes?.sort((pt1, pt2) => pt1.id - pt2.id);

  return productTypes;
}

// field component to display ONE product type
export const ProductTypeField = (props: any) => {
  const { source, ...rest } = props;

  // operations done by the system have 0 as identity (cf db/flex_users.sql)
  return (
    <ReferenceField reference="product_type" source={source} {...rest}>
      <FunctionField render={displayProductType} />
    </ReferenceField>
  );
};

// input component to select ONE product type
export const ProductTypeInput = (props: any) => {
  const productTypes = useGetAllProductTypes();

  return <SelectInput choices={productTypes} {...props} />;
};

// field component to display MULTIPLE product types
export const ProductTypeArrayField = (props: any) => {
  const productTypes = useGetAllProductTypes();

  return (
    <ArrayField source="product_type_ids" {...props}>
      <WithListContext
        render={({ data }) => (
          <Stack direction="row" spacing={2}>
            {data?.map((pt_id) => (
              <Chip
                key={pt_id as any}
                sx={{ marginBottom: 1 }}
                label={displayProductType(
                  productTypes?.find((productType) => productType.id == pt_id),
                )}
              />
            ))}
          </Stack>
        )}
      />
    </ArrayField>
  );
};

// input component to select MULTIPLE product types
export const ProductTypeArrayInput = (props: any) => {
  const { filter, ...rest } = props;
  const productTypes = useGetAllProductTypes();

  return (
    <SelectArrayInput
      choices={filter ? productTypes?.filter(filter) : productTypes}
      {...rest}
    />
  );
};
