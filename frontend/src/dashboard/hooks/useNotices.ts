import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { listNotice, NoticeStatus } from "../../generated-client";
import { getCountAndData } from "../../util";

export const useNotices = (status?: NoticeStatus) => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  return useQuery({
    queryKey: ["notices", { party_id: partyID, status }],
    enabled: partyID != null,
    queryFn: () =>
      listNotice({
        query: {
          party_id: `eq.${partyID}`,
          ...(status != null && { status: `eq.${status}` }),
        },
        headers: {
          Prefer: "count=exact",
        },
      }).then(getCountAndData),
  });
};
