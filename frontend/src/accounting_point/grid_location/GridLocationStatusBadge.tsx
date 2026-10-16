import { useTranslate } from "ra-core";
import { AccountingPointGridLocationQuality } from "../../generated-client";
import { StatusBadge } from "../../components/StatusBadge";
import { gridLocationQualityVariant } from "./gridLocationStatus";

type Props = {
  quality: AccountingPointGridLocationQuality | undefined | null;
  tooltip?: string;
};

export const GridLocationStatusBadge = ({ quality, tooltip }: Props) => {
  const translate = useTranslate();
  return (
    <StatusBadge
      {...gridLocationQualityVariant(quality)}
      tooltip={tooltip}
      label={translate(
        `text.accounting_point_grid_location_panel.status.${quality ? quality.toLowerCase() : "missing"}`,
      )}
    />
  );
};
