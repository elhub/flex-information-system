import React from "react";
import {
  ArrayField,
  FieldProps,
  Link,
  SelectInput,
  useGetOne,
  useRecordContext,
  WithListContext,
} from "react-admin";
import { Stack, Chip, Tooltip } from "@mui/material";
import {
  listSystemOperatorProductType,
  ProductType,
} from "../generated-client";
import { Tag } from "../components/ui";
import {
  ArrayInput,
  ArrayInputOption,
  ArrayInputProps,
} from "../components/EDS-ra/inputs";
import { useQuery } from "@tanstack/react-query";
import { useProductTypes } from "./useProductTypes";
import { throwOnError } from "../util";

export { useProductTypes } from "./useProductTypes";

// display a product type with name and example products if present
export const displayProductType = (productType: ProductType) =>
  productType.name + (productType.products ? ` (${productType.products})` : "");

// hook to get all possible product types sorted by ID
export function useGetAllProductTypes() {
  const { data } = useProductTypes();

  const productTypes = data?.map((product_type) => ({
    id: product_type.id,
    name: displayProductType(product_type),
  }));
  productTypes?.sort((pt1, pt2) => pt1.id - pt2.id);

  return productTypes;
}

export const useGetProductTypesBySystemOperator = (
  systemOperatorId?: number,
) => {
  const { data: allProductTypes, isLoading: ptLoading } = useProductTypes();

  const soptQuery = useQuery({
    queryKey: ["systemOperatorProductType", systemOperatorId],
    enabled: systemOperatorId != null,
    queryFn: () =>
      listSystemOperatorProductType({
        query: { system_operator_id: `eq.${systemOperatorId}` },
      }).then(throwOnError),
  });

  const isLoading =
    ptLoading || (systemOperatorId != null && soptQuery.isLoading);

  if (!systemOperatorId) {
    return { data: allProductTypes, isLoading };
  }

  const filtered = soptQuery.data
    ?.map((sopt) =>
      allProductTypes?.find((pt) => pt.id === sopt.product_type_id),
    )
    .filter((pt) => pt !== undefined);

  return { data: filtered, isLoading };
};

export const ProductTypeField = ({ source }: FieldProps) => {
  const record = useRecordContext()!;
  const { data } = useGetOne("product_type", { id: record[source] });

  return (
    <Link
      to={`/product_type/${record[source]}/show`}
      // If this is not set and this component is in a list, the row click
      // handler applies first, and then we are sent to this link after changing
      // pages. This allows ignoring the potential row click.
      // (cf ReferenceField's implementation in React-Admin)
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
    >
      <Tooltip title={data?.service}>
        <Chip
          label={data ? displayProductType(data) : record[source]}
          size="small"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
          }}
        />
      </Tooltip>
    </Link>
  );
};

// input component to select ONE product type (react-admin SelectInput for legacy use)
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
              <Tag key={pt_id as any}>
                {
                  productTypes?.find(
                    // The typing from react-admin is not great here. It says its a record but its a number
                    (productType) =>
                      productType.id === (pt_id as unknown as number),
                  )?.name
                }
              </Tag>
            ))}
          </Stack>
        )}
      />
    </ArrayField>
  );
};

// input component to select MULTIPLE product types
type ProductTypeArrayInputProps = Omit<ArrayInputProps, "options"> & {
  systemOperatorId?: number;
};

export const ProductTypeArrayInput = ({
  systemOperatorId,
  ...rest
}: ProductTypeArrayInputProps) => {
  const { data: productTypes } =
    useGetProductTypesBySystemOperator(systemOperatorId);

  const options: ArrayInputOption[] =
    productTypes?.map((pt) => ({ value: String(pt.id), label: pt.name })) ?? [];

  return (
    <ArrayInput
      options={options}
      format={(v: number[] | undefined) =>
        (Array.isArray(v) ? v : []).map(String)
      }
      parse={(v: string[]) => (Array.isArray(v) ? v : []).map(Number)}
      {...rest}
    />
  );
};
