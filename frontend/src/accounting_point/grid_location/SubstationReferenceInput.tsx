import React, { useId, useState } from "react";
import { useInput } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { BaseInput } from "../../components/EDS-ra/inputs/BaseInput";
import { Combobox } from "../../components/ui";
import { gridURL } from "../../httpConfig";
import { Substation } from "../show/AccountingPointLocationMap";
import { fetchJSON } from "../../util";

// need at least a name and a business ID to render a substation in the combobox
type SubstationLabel = Pick<Substation, "name" | "business_id">;

type Props = {
  source: string;
  required?: boolean;
  tooltip?: boolean;
  onSelect: (substation: Substation | null) => void;
  knownSubstation?: SubstationLabel | null;
};

export const SubstationReferenceInput = ({
  source,
  required,
  tooltip,
  onSelect,
  knownSubstation,
}: Props) => {
  const { id: inputId, field, fieldState } = useInput({ source });
  const fallbackId = useId();
  const id = inputId || fallbackId;

  const [search, setSearch] = useState("");

  const queryParams = new URLSearchParams({
    kind: "eq.transformer",
    status: "eq.active",
    or: `(business_id.ilike.${search}*,name.ilike.*${search}*)`,
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
    (field.value && knownSubstation?.business_id === field.value
      ? {
          label: `${knownSubstation!.name} (${knownSubstation!.business_id})`,
          value: field.value,
        }
      : field.value
        ? { label: field.value, value: field.value }
        : undefined);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | null,
  ) => {
    const search = event?.currentTarget.value ?? "";
    // sanitise the search string to avoid malformed query params
    const cleanSearch = search.trim().replace(/[^a-zA-Z0-9-\s]/, "");
    setSearch(cleanSearch);
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
