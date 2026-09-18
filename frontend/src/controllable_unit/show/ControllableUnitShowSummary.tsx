import { Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { formatDate } from "date-fns";

export const ControllableUnitShowSummary = ({
  viewModel,
}: {
  viewModel: ControllableUnitShowViewModel;
}) => {
  const { controllableUnit } = viewModel;
  return (
    <div className="flex flex-col gap-4">
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <LabelValue
            size="small"
            labelKey="controllable_unit.business_id"
            value={controllableUnit.business_id}
          />
          <LabelValue
            size="small"
            tooltip
            labelKey="controllable_unit.maximum_active_power"
            value={`${controllableUnit.maximum_active_power} kW`}
          />
          <LabelValue
            size="small"
            tooltip
            labelKey="controllable_unit.regulation_direction"
            value={controllableUnit.regulation_direction}
          />
          <LabelValue
            size="small"
            tooltip
            labelKey="controllable_unit.additional_information"
            value={
              controllableUnit.additional_information ? (
                <span className="whitespace-pre-wrap">
                  {controllableUnit.additional_information}
                </span>
              ) : undefined
            }
          />
          <LabelValue
            size="small"
            labelKey="controllable_unit.recorded_at"
            value={
              controllableUnit.recorded_at
                ? formatDate(controllableUnit.recorded_at, "dd.MM.yyyy HH:mm")
                : undefined
            }
          />
        </div>
      </Panel>
    </div>
  );
};
