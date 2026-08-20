import { FilterPanel } from "./ui";
import { Scale } from "../utils/scales";

type Props = {
  unit: string;
  options: Scale[];
  value: Scale;
  onChange: (scale: Scale) => void;
};

export const ScaleToggle = ({ unit, options, value, onChange }: Props) => {
  return (
    <FilterPanel>
      {options.map((scale) => {
        const label = `${scale.prefix}${unit}`;
        return (
          <FilterPanel.Chip
            key={label}
            selected={scale.exponent === value.exponent}
            onClick={() => onChange(scale)}
          >
            {label}
          </FilterPanel.Chip>
        );
      })}
    </FilterPanel>
  );
};
