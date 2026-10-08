import { IconInformationCircleOutlined } from "@elhub/ds-icons";
import { docsURL } from "../httpConfig";
import { Tooltip } from "./ui";

export const ValidTimeTooltip = () => (
  <Tooltip
    placement="right"
    content={
      <span className="block max-w-[800px]">
        Time values are input in your local timezone. Should you prefer using
        the Norwegian timezone, please change your browser settings accordingly.
        Time interval gaps or duplications due to daylight saving time are not
        handled. You can also visit our{" "}
        <a href={`${docsURL}/technical/time`} className="underline">
          documentation
        </a>{" "}
        to learn more about time handling in the Flexibility Information System.
      </span>
    }
  >
    <span>
      <IconInformationCircleOutlined />
    </span>
  </Tooltip>
);
