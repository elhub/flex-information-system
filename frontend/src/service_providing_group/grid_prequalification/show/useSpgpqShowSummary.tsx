import type { ResourceSummaryField } from "../../../components/ResourceShowLayout";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { useParty } from "../../../hooks/party";
import { toDateTimeString } from "../../../util";

type Props = {
  spgpq: ServiceProvidingGroupGridPrequalification | undefined;
  spg: ServiceProvidingGroup | undefined;
};

export const useSpgpqShowSummary = ({
  spgpq,
  spg,
}: Props): ResourceSummaryField[] => {
  const impactedSystemOperator = useParty(spgpq?.impacted_system_operator_id);

  if (impactedSystemOperator.error) throw impactedSystemOperator.error;

  if (!spgpq) return [];

  return [
    {
      labelKey:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      value: spg ? `${spg.name} (#${spg.id})` : undefined,
    },
    {
      labelKey:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      value: impactedSystemOperator.data?.name,
    },
    {
      shouldShow: !!spgpq.prequalified_at,
      labelKey: "service_providing_group_grid_prequalification.prequalified_at",
      value: toDateTimeString(spgpq.prequalified_at),
    },
  ];
};
