import React, { useId, useState } from "react";
import { useInput } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { BaseInput } from "../../components/EDS-ra/inputs/BaseInput";
import { Combobox } from "../../components/ui";
import { gridURL } from "../../httpConfig";
import { Substation } from "../show/AccountingPointLocationMap";
import { fetchJSON } from "../../util";

type Props = {
  source: string;
  required?: boolean;
  tooltip?: boolean;
  onSelect: (substation: Substation | null) => void;
};

export const SubstationReferenceInput = ({
  source,
  required,
  tooltip,
  onSelect,
}: Props) => {
  const { id: inputId, field, fieldState } = useInput({ source });
  const fallbackId = useId();
  const id = inputId || fallbackId;

  const [search, setSearch] = useState("");

  const queryParams = new URLSearchParams({
    kind: "eq.transformer",
    status: "eq.active",
    business_id: `ilike.${search}*`,
    limit: "10",
    order: "name",
  });

  const { data: substations, isFetching } = useQuery({
    queryKey: ["grid", "substation_search", search],
    queryFn: () =>
      fetchJSON<Substation>(`${gridURL}/substation?${queryParams.toString()}`),
    enabled: search.length >= 2,
    placeholderData: (prev) => prev,
  });

  const options = (substations ?? []).map((s) => ({
    label: `${s.name} (${s.business_id})`,
    value: s.business_id,
  }));

  const selectedOption =
    options.find((o) => o.value === field.value) ??
    (field.value ? { label: field.value, value: field.value } : undefined);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | null,
  ) => {
    setSearch(event?.currentTarget.value ?? "");
  };

  const handleToggle = (value: string, isSelected: boolean) => {
    if (!isSelected) {
      field.onChange(null);
      onSelect(null);
      return;
    }
    const substation = (substations ?? []).find((s) => s.business_id === value);
    field.onChange(value);
    onSelect(substation ?? null);
  };

  return (
    <BaseInput
      source={source}
      required={required}
      tooltip={tooltip}
      id={id}
      error={fieldState.error?.message}
      resource="accounting_point_grid_location"
    >
      <Combobox
        options={[]}
        filteredOptions={options}
        selectedOptions={selectedOption ? [selectedOption] : []}
        onToggleSelected={handleToggle}
        isLoading={isFetching}
        onChange={handleInputChange}
      />
    </BaseInput>
  );
};
