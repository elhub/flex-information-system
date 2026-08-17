import { Button, VerticalSpace } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { Link as RouterLink } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { useTranslate } from "ra-core";

type Props = {
  notice: {
    source?: string;
    data: { flexible_power: number; rated_power: number };
  };
};

const getCuIdFromSource = (source?: string) => {
  const id = Number(source?.split("/")[2]);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

export const NoticeControllableUnitFlexiblePowerExceedsRatedPower = ({
  notice,
}: Props) => {
  const translate = useTranslate();
  const cuId = getCuIdFromSource(notice.source);

  return (
    <>
      <VerticalSpace size="small" />
      <div className="flex flex-col gap-4 mb-4">
        <LabelValue
          size="small"
          labelKey="controllable_unit.maximum_active_power"
          value={notice.data.flexible_power}
          unit="kW"
        />
        <LabelValue
          size="small"
          labelKey="technical_resource.maximum_active_power"
          value={notice.data.rated_power}
          unit="kW"
        />
      </div>
      {cuId != null && (
        <Button
          as={RouterLink}
          to={`/controllable_unit/${cuId}/edit`}
          icon={IconPencil}
        >
          {`${translate("text.edit")} ${translate("text.controllable_unit")}`}
        </Button>
      )}
    </>
  );
};
