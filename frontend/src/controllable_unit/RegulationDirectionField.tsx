import { useRecordContext, useTranslate } from "ra-core";
import { IconArrowUp, IconArrowDown } from "@elhub/ds-icons";
import { Tooltip } from "../components/ui";
import { ControllableUnitRegulationDirection } from "../generated-client";

type RegulationDirectionFieldProps = {
  source: string;
  label?: string | boolean;
};

export const RegulationDirectionField = ({
  source,
}: RegulationDirectionFieldProps) => {
  const translate = useTranslate();
  const record = useRecordContext();
  const value: ControllableUnitRegulationDirection = record?.[source];

  if (!value) return null;

  const label = translate(
    `enum.controllable_unit.regulation_direction.${value}`,
  );
  const iconStyle = { width: 18, height: 18 };

  return (
    <Tooltip content={label}>
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}
      >
        {(value === "up" || value === "both") && (
          <IconArrowUp style={iconStyle} />
        )}
        {(value === "down" || value === "both") && (
          <IconArrowDown style={iconStyle} />
        )}
      </span>
    </Tooltip>
  );
};
