import { IconInformationCircleOutlined } from "@elhub/ds-icons";
import { useTranslate } from "ra-core";
import { useState, type ChangeEvent } from "react";
import { Button, Combobox, FormItem, FormItemLabel, Tooltip } from "../ui";
import { DebouncedTextField } from "./DebouncedTextField";
import type { ListFilterDef, ListFilterOption, ListInterface } from "./types";

// Filter bar with one control per filter definition, plus reset/clear buttons.
export const ListFilters = <T,>({
  filters,
  list,
}: {
  filters: ListFilterDef[];
  list: ListInterface<T>;
}) => {
  const translate = useTranslate();

  if (filters.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap items-end">
      {filters.map((def) => (
        <FilterControl key={def.source} def={def} list={list} />
      ))}
      {list.canResetFilters && (
        <Button variant="invisible" onClick={list.resetFilters} size="small">
          {translate("text.list_filter.reset_filters")}
        </Button>
      )}
      {Object.keys(list.filters).length > 0 && (
        <Button variant="invisible" onClick={list.clearFilters} size="small">
          {translate("text.list_filter.clear_filters")}
        </Button>
      )}
    </div>
  );
};

const FilterControl = <T,>({
  def,
  list,
}: {
  def: ListFilterDef;
  list: ListInterface<T>;
}) => {
  const id = `filter-${def.source}`;
  const value = list.filters[def.source] ?? "";
  const setValue = (v: string | undefined) => list.setFilter(def.source, v);

  return (
    <FormItem id={id} size="small">
      <FilterLabel id={id} label={def.label} tooltip={def.tooltip} />
      {def.type === "text" && (
        <DebouncedTextField id={id} value={value} onChange={setValue} />
      )}
      {def.type === "singleselect" && (
        <SingleSelectFilter def={def} value={value} setValue={setValue} />
      )}
      {def.type === "multiselect" && (
        <MultiSelectFilter def={def} value={value} setValue={setValue} />
      )}
    </FormItem>
  );
};

const FilterLabel = ({
  id,
  label,
  tooltip,
}: {
  id: string;
  label: string;
  tooltip?: string;
}) => (
  <div className="flex items-center gap-2">
    <FormItemLabel htmlFor={id} size="small">
      {label}
    </FormItemLabel>
    {tooltip && (
      <Tooltip content={tooltip}>
        <span>
          <IconInformationCircleOutlined />
        </span>
      </Tooltip>
    )}
  </div>
);

type SingleSelectDef = Extract<ListFilterDef, { type: "singleselect" }>;
type MultiSelectDef = Extract<ListFilterDef, { type: "multiselect" }>;
type ControlProps<D> = {
  def: D;
  value: string;
  setValue: (value: string | undefined) => void;
};

// Combobox only shows options matching the input text. After a selection the
// input holds the selected label, which would hide all other options, so we
// show everything until the user types something different.
const useOptionSearch = (
  options: ListFilterOption[],
  selectedLabel: string,
) => {
  const [typed, setTyped] = useState<string | null>(null);

  const isSearching = typed !== null && typed !== selectedLabel;
  const filteredOptions = isSearching
    ? options.filter((o) => o.label.toLowerCase().includes(typed.toLowerCase()))
    : options;

  const onInputChange = (event: ChangeEvent<HTMLInputElement> | null) => {
    const text = event?.currentTarget?.value;
    const isTyping = event?.type === "change" && typeof text === "string";
    setTyped(isTyping ? text : null);
  };
  const resetSearch = () => setTyped(null);

  return { filteredOptions, onInputChange, resetSearch };
};

const SingleSelectFilter = ({
  def,
  value,
  setValue,
}: ControlProps<SingleSelectDef>) => {
  const translate = useTranslate();
  const selectedOptions = def.options.filter((o) => o.value === value);
  const selectedLabel = selectedOptions[0]?.label ?? "";
  const { filteredOptions, onInputChange, resetSearch } = useOptionSearch(
    def.options,
    selectedLabel,
  );

  const toggle = (option: string, isSelected: boolean) => {
    resetSearch();
    setValue(isSelected ? option : undefined);
  };

  return (
    <Combobox
      noResultsLabel={translate("text.list_filter.no_results")}
      key={value}
      defaultValue={selectedLabel}
      options={def.options}
      filteredOptions={filteredOptions}
      onChange={onInputChange}
      selectedOptions={selectedOptions}
      onToggleSelected={toggle}
    />
  );
};

// multiselect values are stored comma-separated
const parseMulti = (value: string) => (value ? value.split(",") : []);
const serializeMulti = (values: string[]) => values.join(",") || undefined;

const MultiSelectFilter = ({
  def,
  value,
  setValue,
}: ControlProps<MultiSelectDef>) => {
  const translate = useTranslate();
  const selected = parseMulti(value);

  const toggle = (option: string, isSelected: boolean) => {
    const next = isSelected
      ? [...selected, option]
      : selected.filter((v) => v !== option);
    setValue(serializeMulti(next));
  };

  return (
    <Combobox
      noResultsLabel={translate("text.list_filter.no_results")}
      options={def.options}
      isLoading={def.isLoading}
      isMultiSelect
      maxShown={2}
      selectedOptions={def.options.filter((o) => selected.includes(o.value))}
      onToggleSelected={toggle}
    />
  );
};
