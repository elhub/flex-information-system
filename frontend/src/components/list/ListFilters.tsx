import { IconInformationCircleOutlined } from "@elhub/ds-icons";
import { Button, Combobox, FormItem, FormItemLabel, Tooltip } from "../ui";
import { DebouncedTextField } from "./DebouncedTextField";
import type { ListFilterDef, ListInterface } from "./types";

// Filter bar with one control per filter definition, plus reset/clear buttons.
export const ListFilters = <T,>({
  filters,
  list,
}: {
  filters: ListFilterDef[];
  list: ListInterface<T>;
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap items-end">
      {filters.map((def) => (
        <FilterControl key={def.source} def={def} list={list} />
      ))}
      {list.hasDefaultFilters && (
        <Button variant="invisible" onClick={list.resetFilters} size="small">
          Reset filters
        </Button>
      )}
      {Object.keys(list.filters).length > 0 && (
        <Button variant="invisible" onClick={list.clearFilters} size="small">
          Clear filters
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
    <FormItem id={id} size="small" className="w-[16rem]">
      <div className="flex items-center gap-2">
        <FormItemLabel htmlFor={id} size="small">
          {def.label}
        </FormItemLabel>
        {def.tooltip && (
          <Tooltip content={def.tooltip}>
            <span>
              <IconInformationCircleOutlined />
            </span>
          </Tooltip>
        )}
      </div>
      {def.type === "text" ? (
        <DebouncedTextField id={id} value={value} onChange={setValue} />
      ) : def.type === "select" ? (
        <SelectFilter def={def} value={value} setValue={setValue} />
      ) : (
        <MultiSelectFilter def={def} value={value} setValue={setValue} />
      )}
    </FormItem>
  );
};

type SelectDef = Extract<ListFilterDef, { type: "select" }>;
type MultiSelectDef = Extract<ListFilterDef, { type: "multiselect" }>;
type ControlProps<D> = {
  def: D;
  value: string;
  setValue: (value: string | undefined) => void;
};

const SelectFilter = ({ def, value, setValue }: ControlProps<SelectDef>) => (
  <Combobox
    // remount on value change so the typed text follows clear/reset
    key={value}
    defaultValue={def.options.find((o) => o.value === value)?.label ?? ""}
    options={def.options}
    clearButton
    selectedOptions={def.options.filter((o) => o.value === value)}
    onToggleSelected={(option, isSelected) =>
      setValue(isSelected ? option : undefined)
    }
    onClear={() => setValue(undefined)}
  />
);

// multiselect values are stored comma-separated
const parseMulti = (value: string) => (value ? value.split(",") : []);
const serializeMulti = (values: string[]) => values.join(",") || undefined;

const MultiSelectFilter = ({
  def,
  value,
  setValue,
}: ControlProps<MultiSelectDef>) => {
  const current = parseMulti(value);
  return (
    <Combobox
      options={def.options}
      isLoading={def.isLoading}
      isMultiSelect
      selectedOptions={def.options.filter((o) => current.includes(o.value))}
      onToggleSelected={(option, isSelected) =>
        setValue(
          serializeMulti(
            isSelected
              ? [...current, option]
              : current.filter((v) => v !== option),
          ),
        )
      }
    />
  );
};
