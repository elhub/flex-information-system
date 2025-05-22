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

function displayProductType(productType: any) {
  return (
    productType.name +
    (productType.products ? ` (${productType.products})` : "")
  );
}

// field to display a product type as human-readable information
export const ProductTypeField = (props: any) => {
  const { source, ...rest } = props;

  // operations done by the system have 0 as identity (cf db/flex_users.sql)
  return (
    <ReferenceField reference="product_type" source={source} {...rest}>
      <FunctionField render={displayProductType} />
    </ReferenceField>
  );
};

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

export const ProductTypeInput = (props: any) => {
  const productTypes = useGetAllProductTypes();

  return <SelectInput choices={productTypes} {...props} />;
};

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
