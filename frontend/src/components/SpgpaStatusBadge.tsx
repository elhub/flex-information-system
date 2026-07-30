import { Badge } from "./ui";
import { useTranslateEnum } from "../intl/intl";
import { spgpaStatusVariantMap } from "../service_providing_group/product_application/spgpaStatus";
import { type EnumLabel } from "../intl/enum-labels";

type Props = {
  status: string | undefined;
};

export const SpgpaStatusBadge = ({ status }: Props) => {
  const te = useTranslateEnum();

  if (!status) return <>—</>;

  const variant =
    spgpaStatusVariantMap[status as keyof typeof spgpaStatusVariantMap];
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
        `service_providing_group_product_application.status.${status}` as EnumLabel,
      )}
    </Badge>
  );
};
