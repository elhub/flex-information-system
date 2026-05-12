import { tooltips, TooltipKey } from "../../../tooltip/tooltips";

type TooltipTextParams =
  | {
      tooltipKey: TooltipKey;
    }
  | {
      resource: string | undefined;
      field: string | undefined;
    };

export const useTooltipText = (
  params: TooltipTextParams,
): string | undefined => {
  if ("tooltipKey" in params) {
    return tooltips[params.tooltipKey];
  }

  const key = `${params.resource}.${params.field}` as TooltipKey;
  return key in tooltips ? tooltips[key] : undefined;
};
