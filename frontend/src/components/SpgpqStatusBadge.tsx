import { Badge } from "./ui";
import { useTranslateEnum } from "../intl/intl";
import { spgpqStatusVariantMap } from "../service_providing_group/grid_prequalification/spgpqStatus";
import { type EnumLabel } from "../intl/enum-labels";

type Props = {
  status: string | undefined;
};

export const SpgpqStatusBadge = ({ status }: Props) => {
  const te = useTranslateEnum();

  if (!status) return <>—</>;

  const variant =
    spgpqStatusVariantMap[status as keyof typeof spgpqStatusVariantMap];
  if (!variant) return <>{status}</>;

  return (
    <Badge
      size="small"
      status={variant.status}
      variant="block"
      icon={variant.icon}
      style={{ whiteSpace: "nowrap" }}
    >
      {te(
        `service_providing_group_grid_prequalification.status.${status}` as EnumLabel,
      )}
    </Badge>
  );
};
