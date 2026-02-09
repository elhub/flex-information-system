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
    <FlexDiv style={{ gap: "var(--eds-size-2)", alignItems: "center" }}>
      <Heading level={1} size="xlarge">
        Controllable Unit - {controllableUnit?.name} (
        {controllableUnit?.maximum_available_capacity} kW)
      </Heading>
      <Tag variant={statusVariantMap[controllableUnit?.status ?? "active"]}>
        {controllableUnit?.status ?? "active"}
      </Tag>
    </FlexDiv>
  );
};
