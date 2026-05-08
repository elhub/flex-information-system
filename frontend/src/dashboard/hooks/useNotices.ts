import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { listNotice } from "../../generated-client";
import { getCountAndData } from "../../util";

export const useNotices = () => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  return useQuery({
    queryKey: ["notices", { party_id: partyID }],
    enabled: partyID != null,
    queryFn: () =>
      listNotice({
        query: {
          party_id: `eq.${partyID}`,
        },
        headers: {
          Prefer: "count=exact",
        },
      }).then(getCountAndData),
  });
};
