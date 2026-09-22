import { Button } from "../../components/ui";
import { Link as RouterLink } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { useTranslate } from "ra-core";

type Props = {
  notice: {
    source?: string;
  };
};

const getCuIdFromSource = (source?: string) => {
  const id = Number(source?.split("/")[2]);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

export const NoticeControllableUnitMaximumActivePowerRatio = ({
  notice,
}: Props) => {
  const translate = useTranslate();
  const cuId = getCuIdFromSource(notice.source);

  return cuId != null ? (
    <Button
      as={RouterLink}
      to={`/controllable_unit/${cuId}/show`}
      icon={IconPencil}
    >
      {`${translate("text.edit")} ${translate("text.controllable_unit")}`}
    </Button>
  ) : null;
};
