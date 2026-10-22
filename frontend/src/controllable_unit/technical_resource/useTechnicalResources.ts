import { useQuery } from "@tanstack/react-query";
import { listTechnicalResource } from "../../generated-client";
import { throwOnError } from "../../util";

export const technicalResourcesQueryKey = (
  controllableUnitId: number | undefined,
) => ["technical_resource", { controllable_unit_id: controllableUnitId }];

export const useTechnicalResources = (controllableUnitId: number | undefined) =>
  useQuery({
    queryKey: technicalResourcesQueryKey(controllableUnitId),
    queryFn: () =>
      listTechnicalResource({
        query: {
          controllable_unit_id: `eq.${controllableUnitId}`,
          order: "id.desc",
        },
      }).then(throwOnError),
    enabled: !!controllableUnitId,
  });
