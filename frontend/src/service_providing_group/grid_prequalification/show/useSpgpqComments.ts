import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServiceProvidingGroupGridPrequalificationComment,
  listServiceProvidingGroupGridPrequalificationComment,
  updateServiceProvidingGroupGridPrequalificationComment,
} from "../../../generated-client";
import type { ServiceProvidingGroupGridPrequalificationCommentVisibility } from "../../../generated-client/types.gen";
import { throwOnError } from "../../../util";

const spgpqCommentsQueryKey = (spgpqId: number) => ["spgpq_comments", spgpqId];

export function useSpgpqComments(spgpqId: number | undefined) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: spgpqCommentsQueryKey(spgpqId ?? 0),
    queryFn: () =>
      listServiceProvidingGroupGridPrequalificationComment({
        query: {
          service_providing_group_grid_prequalification_id: `eq.${spgpqId}`,
          order: "created_at.desc",
        },
      }).then(throwOnError),
    enabled: !!spgpqId,
  });

  const postComment = useMutation({
    mutationFn: ({
      content,
      visibility,
    }: {
      content: string;
      visibility: ServiceProvidingGroupGridPrequalificationCommentVisibility;
    }) => {
      if (!spgpqId) return Promise.reject(new Error("No spgpqId"));
      return createServiceProvidingGroupGridPrequalificationComment({
        body: {
          service_providing_group_grid_prequalification_id: spgpqId,
          content,
          visibility,
        },
      }).then(throwOnError);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: spgpqCommentsQueryKey(spgpqId ?? 0),
      }),
  });

  const editComment = useMutation({
    mutationFn: ({
      id,
      content,
      visibility,
    }: {
      id: number;
      content: string;
      visibility: ServiceProvidingGroupGridPrequalificationCommentVisibility;
    }) =>
      updateServiceProvidingGroupGridPrequalificationComment({
        path: { id },
        body: { content, visibility },
      }).then(throwOnError),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: spgpqCommentsQueryKey(spgpqId ?? 0),
      }),
  });

  return { commentsQuery, postComment, editComment };
}
