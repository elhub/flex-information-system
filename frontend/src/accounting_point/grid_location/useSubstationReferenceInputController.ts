import { useId, useState } from "react";
import type { ChangeEvent } from "react";
import { useInput, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { gridURL } from "../../httpConfig";
import { Substation } from "../show/AccountingPointLocationMap";
import { fetchJSON } from "../../util";

// need at least a name and a business ID to render a substation in the combobox
type SubstationLabel = Pick<Substation, "name" | "business_id">;

// Controller/logic layer: owns RA (useInput, useTranslate), the substation
// search query, and option/selection mapping. Returns plain data/functions
// only � no BaseInput/Combobox imports.
export const useSubstationReferenceInputController = ({
  source,
  onSelect,
  knownSubstation,
}: {
  source: string;
  onSelect: (substation: Substation | null) => void;
  knownSubstation?: SubstationLabel | null;
}) => {
  const translate = useTranslate();
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

  const handleInputChange = (event: ChangeEvent<HTMLInputElement> | null) => {
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

  return {
    id,
    error: fieldState.error?.message,
    descriptionText: translate(
      "text.substation_reference_input.search_for_substation",
    ),
    options,
    selectedOption,
    isFetching,
    handleInputChange,
    handleToggle,
  };
};
