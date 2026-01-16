import { Tooltip } from "@elhub/ds-components";
import { IconInformationCircleOutlined } from "@elhub/ds-icons";
import { tooltips, TooltipKey } from "../../../tooltip/tooltips";

type TooltipProps =
  | {
      tooltipKey: TooltipKey;
    }
  | {
      resource: string | undefined;
      field: string | undefined;
    };

export const FieldTooltip = (props: TooltipProps) => {
  const title =
    "tooltipKey" in props
      ? tooltips[props.tooltipKey]
      : `${props.resource}.${props.field}` in tooltips
        ? tooltips[`${props.resource}.${props.field}` as TooltipKey]
        : undefined;

  if (!title) {
    return null;
  }

  return (
    <Tooltip content={title}>
      <span>
        <IconInformationCircleOutlined />
      </span>
    </Tooltip>
  );
};
