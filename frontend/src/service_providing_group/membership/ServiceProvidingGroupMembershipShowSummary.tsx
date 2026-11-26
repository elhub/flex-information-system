import type { ResourceSummaryField } from "../../components/ResourceShowLayout";
import { ServiceProvidingGroupMembershipHistory } from "../../generated-client";
import { toDateTimeString } from "../../util";

type Props = {
  membership: ServiceProvidingGroupMembershipHistory | undefined;
};

export const useServiceProvidingGroupMembershipShowSummary = ({
  membership,
}: Props): ResourceSummaryField[] => {
  if (!membership) return [];

  return [
    {
      tooltip: true,
      labelKey: "service_providing_group_membership.valid_from",
      value: toDateTimeString(membership.valid_from),
    },
    {
      tooltip: true,
      labelKey: "service_providing_group_membership.valid_to",
      value: toDateTimeString(membership.valid_to),
    },
  ];
};
