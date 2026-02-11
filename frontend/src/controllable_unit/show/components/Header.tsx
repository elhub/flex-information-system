import {
  ControllableUnit,
  ControllableUnitStatus,
} from "../../../generated-client";
import { FlexDiv, Heading, Tag } from "../../../components/ui";

const statusVariantMap: Record<
  ControllableUnitStatus,
  "info" | "success" | "warning" | "error"
> = {
  new: "info",
  active: "success",
  inactive: "warning",
  terminated: "error",
};

export const Header = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  return (
    <FlexDiv className="flex flex-row items-center gap-3">
      <Heading level={1} size="large">
        Controllable Unit - {controllableUnit?.name} (
        {controllableUnit?.maximum_available_capacity} kW)
      </Heading>
      <Tag variant={statusVariantMap[controllableUnit?.status ?? "active"]}>
        {controllableUnit?.status ?? "active"}
      </Tag>
    </FlexDiv>
  );
};
