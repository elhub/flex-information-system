// frontend/src/service_providing_group/product_application/show/SpgpaCommentFeed.tsx
import { usePermissions } from "ra-core";
import type { Permissions } from "../../../auth/permissions";
import { CommentFeed } from "../../../components/CommentFeed";
import { useSpgpaComments } from "./useSpgpaComments";

type SpgpaCommentFeedProps = {
  spgpaId: number;
};

export function SpgpaCommentFeed({ spgpaId }: SpgpaCommentFeedProps) {
  const { commentsQuery, postComment } = useSpgpaComments(spgpaId);
  const { permissions } = usePermissions<Permissions>();

  const canCreate =
    permissions?.allow(
      "service_providing_group_product_application_comment",
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
