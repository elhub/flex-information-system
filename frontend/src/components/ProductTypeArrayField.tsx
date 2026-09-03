import { Tag } from "./ui";
import { useQuery } from "@tanstack/react-query";
import { listProductType, ProductType } from "../generated-client";
import { throwOnError } from "../util";

// display a product type with name and example products if present
const displayProductType = (productType: ProductType) =>
  productType.name + (productType.products ? ` (${productType.products})` : "");

const PRODUCT_TYPE_QUERY_KEY = ["product_type", "all"] as const;

// hook to get all possible product types sorted by ID
function useGetAllProductTypes() {
  const { data } = useQuery({
    queryKey: PRODUCT_TYPE_QUERY_KEY,
    queryFn: () => listProductType().then(throwOnError),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const productTypes = data?.map((product_type) => ({
    id: product_type.id,
    name: displayProductType(product_type),
  }));
  productTypes?.sort((pt1, pt2) => pt1.id - pt2.id);

  return productTypes;
}

type ProductTypeArrayFieldProps = {
  productTypeIds: number[];
};

// component displaying MULTIPLE product types
export const ProductTypeArrayField = ({
  productTypeIds,
}: ProductTypeArrayFieldProps) => {
  const productTypes = useGetAllProductTypes();

  return (
    <div className="flex flex-row gap-2">
      {productTypeIds?.map((ptId) => (
        <Tag key={ptId}>
          {productTypes?.find((productType) => productType.id === ptId)?.name}
        </Tag>
      ))}
    </div>
  );
};
