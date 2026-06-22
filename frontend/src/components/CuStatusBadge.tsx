import { Badge } from "./ui";
import { useTranslateEnum } from "../intl/intl";
import { cuStatusVariantMap } from "../controllable_unit/controllableUnitStatus";
import { type EnumLabel } from "../intl/enum-labels";

type Props = {
  status: string | undefined;
};

export const CuStatusBadge = ({ status }: Props) => {
  const te = useTranslateEnum();

  if (!status) return <>—</>;

  const variant = cuStatusVariantMap[status as keyof typeof cuStatusVariantMap];
  if (!variant) return <>{status}</>;

  return (
    <Badge
      size="small"
      status={variant.status}
      variant="block"
      icon={variant.icon}
      style={{ whiteSpace: "nowrap" }}
    >
      {te(`controllable_unit.status.${status}` as EnumLabel)}
    </Badge>
  );
};
