import { Tooltip } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import { tooltips } from "./tooltips";
import { TooltipKey } from "./tooltips";

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
    <Tooltip title={title} arrow>
      <HelpIcon fontSize="small" color="disabled" />
    </Tooltip>
  );
};
