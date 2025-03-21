import { Tooltip } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import tooltips from "./tooltips.json";

export const FieldTooltip = (props: any) => {
  const resource = props.resource?.replace("_history", "");
  const title = (tooltips as any)[resource][props.field];
  return title ? (
    <Tooltip title={title} arrow>
      <HelpIcon fontSize="small" color="disabled" />
    </Tooltip>
  ) : null;
};
