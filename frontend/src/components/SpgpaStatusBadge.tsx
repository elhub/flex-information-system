import { Badge, Tooltip } from "./ui";
import { useTranslateEnum } from "../intl/intl";
import { useTranslate } from "ra-core";
import {
  spgpaStatusVariantMap,
  DRAFT_STATUS,
} from "../service_providing_group/product_application/spgpaStatus";
import { type EnumLabel } from "../intl/enum-labels";

type Props = {
  status: string | undefined;
};

export const SpgpaStatusBadge = ({ status }: Props) => {
  const te = useTranslateEnum();
  const translate = useTranslate();

  if (!status) return <>—</>;

  const variant =
    spgpaStatusVariantMap[status as keyof typeof spgpaStatusVariantMap];
  if (!variant) return <>{status}</>;

  const badge = (
    <Badge
      size="small"
      status={variant.status}
      variant="block"
      icon={variant.icon}
      style={{ whiteSpace: "nowrap" }}
    >
      {status === DRAFT_STATUS
        ? translate("text.spgpa_draft_status_label")
        : te(
            `service_providing_group_product_application.status.${status}` as EnumLabel,
          )}
    </Badge>
  );

  if (status === DRAFT_STATUS) {
    return (
      <Tooltip content={translate("text.spgpa_draft_status_tooltip")}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
};
