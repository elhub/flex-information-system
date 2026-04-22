import { usePermissions } from "ra-core";
import type { Permissions } from "../../../auth/permissions";
import { CommentFeed } from "../../../components/comments/CommentFeed";
import { useSpgpqComments } from "./useSpgpqComments";

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
