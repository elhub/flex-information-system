import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { docsURL } from "../httpConfig";

export const ValidTimeTooltip = styled(({ className, ...props }: any) => {
  return (
    <Tooltip
      {...props}
      classes={{ popper: className }}
      TransitionComponent={Zoom}
      title={
        <React.Fragment>
          {
            "Time values are input in your local timezone. Should you prefer\
            using the Norwegian timezone, please change your browser settings\
            accordingly. Time interval gaps or duplications due to daylight\
            saving time are not handled. You can also visit our "
          }
          <a href={`${docsURL}/technical/time`} style={{ color: "white" }}>
            documentation
          </a>
          {
            " to learn more about time handling in the Flexibility Information System."
          }
        </React.Fragment>
      }
      arrow
      placement="right"
      sx={{ fontSize: 20 }}
    >
      <InfoOutlinedIcon />
    </Tooltip>
  );
})(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontWeight: "normal",
    fontSize: 16,
    maxWidth: 800,
  },
}));
