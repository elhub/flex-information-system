import { ControllableUnit } from "../../../generated-client";
import { LabelValue } from "../../../components/LabelValue";

export const GridValidation = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <div className="grid grid-cols-[1fr_5fr]  gap-2">
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.grid_node_id"
        value={controllableUnit?.grid_node_id}
      />
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.grid_validation_status"
        value={controllableUnit?.grid_validation_status}
      />
      <LabelValue
        tooltip={true}
        labelKey="controllable_unit.grid_validation_notes"
        value={controllableUnit?.grid_validation_notes}
      />
    </div>
  );
};
