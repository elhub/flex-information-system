import { Button } from "../../components/ui";
import { Link as RouterLink } from "react-router-dom";
import { useTranslate } from "ra-core";

type Props = {
  notice: {
    source?: string;
  };
};

export const NoticeInsufficientGridLocationSource = ({ notice }: Props) => {
  const translate = useTranslate();
  return notice.source != null ? (
    <Button as={RouterLink} to={`${notice.source}/show`}>
      {translate("text.notice_missing_grid_location_button")}
    </Button>
  ) : null;
};
