import { Tooltip } from "../../ui";
import { IconInformationCircleOutlined } from "@elhub/ds-icons";
import { TooltipKey } from "../../../tooltip/tooltips";
import { useTooltipText } from "./useTooltipText";

type TooltipProps =
  | {
      tooltipKey: TooltipKey;
    }
  | {
      resource: string | undefined;
      field: string | undefined;
    };

export const FieldTooltip = (props: TooltipProps) => {
  const title = useTooltipText(props);

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
