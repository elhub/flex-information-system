import {
  CardContent,
  CardHeader,
  Card,
  Loader,
  BodyText,
  Button,
  CardFooter,
  CardHeaderContent,
  CardTitle,
} from "../../components/ui/index";
import { Link as RouterLink } from "react-router-dom";
import { readEntity } from "../../generated-client/index";
import { useQuery } from "@tanstack/react-query";
import { throwOnError } from "../../util";
import { useTranslateEnum } from "../../intl/intl";
import { useTranslate } from "ra-core";

type Props = {
  entityId: number;
};

export const EntityShow = ({ entityId }: Props) => {
  const translateEnum = useTranslateEnum();
  const translate = useTranslate();
  const { data, isLoading } = useQuery({
    queryKey: ["entity", entityId],
    queryFn: () => readEntity({ path: { id: entityId } }).then(throwOnError),
    enabled: !!entityId,
  });

  if (!data) {
    return <div>{translate("text.simple_table.no_results")}</div>;
  }

  if (isLoading) {
    return <Loader />;
  }
  return (
    <Card>
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>{data?.name}</CardTitle>
        </CardHeaderContent>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <BodyText weight="bold" size="small">
            Type:
          </BodyText>
          <BodyText size="small">
            {translateEnum(`entity.type.${data?.type}`)}
          </BodyText>
        </div>
        <div>
          <BodyText weight="bold" size="small">
            Business ID:
          </BodyText>
          <BodyText size="small">{data?.id}</BodyText>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="tertiary"
          size="medium"
          as={RouterLink}
          to={`/entity/${data?.id}/show`}
        >
          {translateEnum("entity.see_more")}
        </Button>
      </CardFooter>
    </Card>
  );
};
