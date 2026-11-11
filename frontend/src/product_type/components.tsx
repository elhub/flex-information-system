import React, { useEffect, useRef } from "react";
import {
  FieldProps,
  Link,
  SelectInput,
  useGetOne,
  useRecordContext,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import { useInput, useTranslate } from "ra-core";
import {
  Select,
  SelectContent,
  SelectItem,
  Tag,
  Tooltip,
} from "../components/ui";
import {
  listSystemOperatorProductType,
  ProductType,
} from "../generated-client";
import {
  ArrayInput,
  ArrayInputOption,
  ArrayInputProps,
  BaseInput,
  BaseInputProps,
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

const useGetProductTypesBySystemOperator = (
  systemOperatorId?: number,
  status?: "active" | "inactive",
) => {
  const { data: allProductTypes, isLoading: ptLoading } = useProductTypes();

  const soptQuery = useQuery({
    queryKey: ["systemOperatorProductType", systemOperatorId],
    enabled: systemOperatorId != null,
    queryFn: () =>
      listSystemOperatorProductType({
        query: {
          system_operator_id: `eq.${systemOperatorId}`,
          ...(status && { status: `eq.${status}` }),
        },
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
      <Tooltip content={data?.service ?? ""}>
        <span>
          <Tag size="small">
            {data ? displayProductType(data) : record[source]}
          </Tag>
        </span>
      </Tooltip>
    </Link>
  );
};

// input component to select ONE product type (react-admin SelectInput for legacy use)
export const ProductTypeInput = (props: any) => {
  const productTypes = useGetAllProductTypes();

  return <SelectInput choices={productTypes} {...props} />;
};

// input component to select MULTIPLE product types
type ProductTypeArrayInputProps = Omit<ArrayInputProps, "options"> & {
  systemOperatorId?: number;
  status?: "active" | "inactive";
};

export const ProductTypeArrayInput = ({
  systemOperatorId,
  status,
  ...rest
}: ProductTypeArrayInputProps) => {
  const { data: productTypes } = useGetProductTypesBySystemOperator(
    systemOperatorId,
    status,
  );

  const options: ArrayInputOption[] =
    productTypes?.map((pt) => ({
      value: String(pt.id),
      label: displayProductType(pt),
    })) ?? [];

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

// input component to select MULTIPLE product types, restricted to the active
// product types of a system operator referenced by another form field;
// resets the selection whenever that system operator field changes
type SystemOperatorProductTypesInputProps = Pick<
  BaseInputProps,
  "source" | "required" | "description" | "tooltip"
> & {
  systemOperatorSource: string;
};

const useResetOnSystemOperatorChange = (
  systemOperatorSource: string,
  source: string,
) => {
  const { setValue, watch, getValues } = useFormContext();
  const systemOperatorID = watch(systemOperatorSource);
  const previousSystemOperatorID = useRef(systemOperatorID);

  useEffect(() => {
    if (previousSystemOperatorID.current !== systemOperatorID) {
      if (getValues(source)?.length) {
        setValue(source, []);
      }
      previousSystemOperatorID.current = systemOperatorID;
    }
  }, [systemOperatorID, getValues, setValue, source]);

  return systemOperatorID;
};

export const SystemOperatorProductTypesInput = ({
  systemOperatorSource,
  source,
  ...rest
}: SystemOperatorProductTypesInputProps) => {
  const systemOperatorID = useResetOnSystemOperatorChange(
    systemOperatorSource,
    source,
  );

  return (
    <ProductTypeArrayInput
      systemOperatorId={systemOperatorID}
      source={source}
      {...rest}
      status={"active"}
    />
  );
};

// input component to select ONE product type, restricted to the active
// product types of a system operator referenced by another form field. The
// form value is still an array with a single id, as in the API.
export const SystemOperatorProductTypeInput = ({
  systemOperatorSource,
  source,
  required,
  tooltip,
  description,
}: SystemOperatorProductTypesInputProps) => {
  const translate = useTranslate();
  const systemOperatorID = useResetOnSystemOperatorChange(
    systemOperatorSource,
    source,
  );
  const { data: productTypes } = useGetProductTypesBySystemOperator(
    systemOperatorID,
    "active",
  );
  const { id, field, fieldState } = useInput({ source });

  const selected: number | undefined = Array.isArray(field.value)
    ? field.value[0]
    : undefined;

  return (
    <BaseInput
      source={source}
      required={required}
      tooltip={tooltip}
      id={id}
      error={fieldState.error?.message}
      description={description}
    >
      <Select
        className="min-w-48"
        value={selected === undefined ? "" : String(selected)}
        onValueChange={(value: string) => field.onChange([Number(value)])}
        placeholder={translate("text.select_placeholder")}
      >
        <SelectContent>
          {productTypes
            ?.slice()
            .sort((a, b) => a.id - b.id)
            .map((pt) => (
              <SelectItem key={pt.id} value={String(pt.id)}>
                {displayProductType(pt)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </BaseInput>
  );
};
