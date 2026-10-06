import {
  Loader,
} from "../../components/ui/index";
import { readEntity } from "../../generated-client/index";
import { useQuery } from "@tanstack/react-query";
import { throwOnError } from "../../util";
import { useTranslateEnum } from "../../intl/intl";
import { useTranslate } from "ra-core";
import {ResourceCard} from "../../components/ResourceCard";

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
    <ResourceCard
      title={data?.name}
      content={[
        {
          label: "Business ID",
          value: data?.business_id,
        },
        {
          label: "Type",
          value: data?.type,
        },
      ]}
      to={`/entity/${data?.id}/show`}
      linkText={translate("text.entity.see_more")}
    />
  );
};
