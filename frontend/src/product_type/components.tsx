import React from "react";
import {
  ArrayField,
  FieldProps,
  Link,
  SelectInput,
  useGetList,
  useGetOne,
  useRecordContext,
  WithListContext,
} from "react-admin";
import { useInput } from "ra-core";
import { Stack, Chip, Tooltip } from "@mui/material";
import { ProductType } from "../generated-client";
import { Tag, Combobox } from "../components/ui";
import {
  BaseInput,
  BaseInputProps,
  ArrayInputOption,
} from "../components/EDS-ra/inputs";

// display a product type with name and example products if present
export const displayProductType = (productType: ProductType) =>
  productType.name + (productType.products ? ` (${productType.products})` : "");

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
                  productTypes?.find((productType) => productType.id == pt_id)
                    ?.name
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
type ProductTypeArrayInputProps = BaseInputProps & {
  filter?: (pt: { id: number; name: string }) => boolean;
  placeholder?: string;
};

export const ProductTypeArrayInput = ({
  filter,
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  placeholder,
  overrideLabel,
}: ProductTypeArrayInputProps) => {
  const productTypes = useGetAllProductTypes();

  const options: ArrayInputOption[] = (
    typeof filter === "function"
      ? (productTypes ?? []).filter(filter)
      : (productTypes ?? [])
  ).map((pt) => ({ value: String(pt.id), label: pt.name }));

  const { id, field, fieldState } = useInput({
    source,
    format: (v: number[] | undefined) =>
      (Array.isArray(v) ? v : []).map(String),
    parse: (v: string[]) => (Array.isArray(v) ? v : []).map(Number),
  });

  const selectedOptions = options.filter((option) =>
    (field.value as string[] | undefined)?.includes(option.value),
  );

  const handleToggle = (value: string, isSelected: boolean) => {
    const currentValues = (field.value as string[] | undefined) ?? [];
    if (isSelected) {
      field.onChange([...currentValues, value]);
    } else {
      field.onChange(currentValues.filter((v) => v !== value));
    }
  };

  return (
    <BaseInput
      source={source}
      required={required}
      tooltip={tooltip}
      disabled={disabled}
      readOnly={readOnly}
      overrideLabel={overrideLabel}
      id={id}
      error={fieldState.error?.message}
    >
      <Combobox
        options={options}
        selectedOptions={selectedOptions}
        onToggleSelected={handleToggle}
        isMultiSelect
        placeholder={placeholder}
        disabled={disabled || readOnly}
      />
    </BaseInput>
  );
};
