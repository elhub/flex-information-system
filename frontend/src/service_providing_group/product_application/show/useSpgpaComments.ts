import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServiceProvidingGroupProductApplicationComment,
  listServiceProvidingGroupProductApplicationComment,
  updateServiceProvidingGroupProductApplicationComment,
} from "../../../generated-client";
import type { ServiceProvidingGroupProductApplicationCommentVisibility } from "../../../generated-client/types.gen";
import { throwOnError } from "../../../util";

const spgpaCommentsQueryKey = (spgpaId: number) => ["spgpa_comments", spgpaId];

export function useSpgpaComments(spgpaId: number | undefined) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: spgpaCommentsQueryKey(spgpaId ?? 0),
    queryFn: () =>
      listServiceProvidingGroupProductApplicationComment({
        query: {
          service_providing_group_product_application_id: `eq.${spgpaId}`,
          order: "created_at.desc",
        },
      }).then(throwOnError),
    enabled: !!spgpaId,
  });

  const postComment = useMutation({
    mutationFn: ({
      content,
      visibility,
    }: {
      content: string;
      visibility: ServiceProvidingGroupProductApplicationCommentVisibility;
    }) => {
      if (!spgpaId) return Promise.reject(new Error("No spgpaId"));
      return createServiceProvidingGroupProductApplicationComment({
        body: {
          service_providing_group_product_application_id: spgpaId,
          content,
          visibility,
        },
      }).then(throwOnError);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: spgpaCommentsQueryKey(spgpaId ?? 0),
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
      visibility: ServiceProvidingGroupProductApplicationCommentVisibility;
    }) =>
      updateServiceProvidingGroupProductApplicationComment({
        path: { id },
        body: { content, visibility },
      }).then(throwOnError),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: spgpaCommentsQueryKey(spgpaId ?? 0),
      }),
  });

  return { commentsQuery, postComment, editComment };
}
