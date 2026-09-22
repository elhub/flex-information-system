import { Button } from "../../components/ui/index";
import { useTranslate } from "ra-core";
import { Link as RouterLink } from "react-router-dom";
import { Notice } from "../../generated-client/index";

type Props = {
  notice: Notice;
  buttonTextKey: string;
};

export const NoticeActionButton = ({ notice, buttonTextKey }: Props) => {
  const translate = useTranslate();
  return notice.source != null ? (
    <Button as={RouterLink} to={`${notice.source}/show`}>
      {translate(buttonTextKey)}
    </Button>
  ) : null;
};
