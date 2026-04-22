import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "ra-core";
import {
  createServiceProvidingGroupGridPrequalificationComment,
  listServiceProvidingGroupGridPrequalificationComment,
} from "../../../generated-client";
import type { ServiceProvidingGroupGridPrequalificationCommentVisibility } from "../../../generated-client/types.gen";
import { throwOnError } from "../../../util";
import type { Permissions } from "../../../auth/permissions";
import { CommentFeed } from "../../../components/comments/CommentFeed";

const spgpqCommentsQueryKey = (spgpqId: number) => ["spgpq_comments", spgpqId];

function useSpgpqComments(spgpqId: number | undefined) {
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

  return { commentsQuery, postComment };
}

type SpgpqCommentFeedProps = {
  spgpqId: number;
};

export function SpgpqCommentFeed({ spgpqId }: SpgpqCommentFeedProps) {
  const { commentsQuery, postComment } = useSpgpqComments(spgpqId);
  const { permissions } = usePermissions<Permissions>();

  const canCreate =
    permissions?.allow(
      "service_providing_group_grid_prequalification_comment",
      "create",
    ) ?? false;

  return (
    <CommentFeed
      commentsQuery={commentsQuery}
      postComment={postComment}
      canCreate={canCreate}
    />
  );
}
