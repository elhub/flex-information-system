import { MeteringGridArea, Party } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";

export const AccountingPointConnections = ({
  endUser,
  meteringGridArea,
}: {
  endUser: Party | undefined;
  meteringGridArea: MeteringGridArea | undefined;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <LabelValue
        size="large"
        labelKey="accounting_point_end_user.end_user_id"
        value={endUser?.name}
      />

      <LabelValue
        size="large"
        labelKey="accounting_point_metering_grid_area.metering_grid_area_id"
        value={meteringGridArea?.name}
      />
    </div>
  );
};
