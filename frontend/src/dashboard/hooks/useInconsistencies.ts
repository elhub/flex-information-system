import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { listNotice } from "../../generated-client";
import { throwOnError } from "../../util";

const inconsistencyNoticeTypes = [
  "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract",
  "no.elhub.flex.service_providing_group.balance_responsible_party.multiple",
  "no.elhub.flex.service_providing_group_membership.valid_time.outside_contract",
  "no.elhub.flex.service_providing_group_membership.bidding_zone_mismatch",
];

export const useInconsistencies = () => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  return useQuery({
    queryKey: ["notices", { party_id: partyID }],
    enabled: partyID != null,
    queryFn: () =>
      listNotice({
        query: {
          party_id: `eq.${partyID}`,
          type: `in.(${inconsistencyNoticeTypes.join(",")})`,
        },
      }).then(throwOnError),
  });
};
