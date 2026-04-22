import { usePermissions } from "ra-core";
import type { Permissions } from "../../auth/permissions";
import { CommentFeed } from "../../components/comments/CommentFeed";
import { useSppaComments } from "./useSppaComments";

type SppaCommentFeedProps = {
  sppaId: number;
};

export function SppaCommentFeed({ sppaId }: SppaCommentFeedProps) {
  const { commentsQuery, postComment } = useSppaComments(sppaId);
  const { permissions } = usePermissions<Permissions>();

  const canCreate =
    permissions?.allow(
      "service_provider_product_application_comment",
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
