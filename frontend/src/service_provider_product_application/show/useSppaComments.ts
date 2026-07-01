import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServiceProviderProductApplicationComment,
  listServiceProviderProductApplicationComment,
  updateServiceProviderProductApplicationComment,
} from "../../generated-client";
import type { ServiceProviderProductApplicationCommentVisibility } from "../../generated-client/types.gen";
import { throwOnError } from "../../util";

const sppaCommentsQueryKey = (sppaId: number) => ["sppa_comments", sppaId];

export function useSppaComments(sppaId: number | undefined) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: sppaCommentsQueryKey(sppaId ?? 0),
    queryFn: () =>
      listServiceProviderProductApplicationComment({
        query: {
          service_provider_product_application_id: `eq.${sppaId}`,
          order: "created_at.desc",
        },
      }).then(throwOnError),
    enabled: !!sppaId,
  });

  const postComment = useMutation({
    mutationFn: ({
      content,
      visibility,
    }: {
      content: string;
      visibility: ServiceProviderProductApplicationCommentVisibility;
    }) => {
      if (!sppaId) return Promise.reject(new Error("No sppaId"));
      return createServiceProviderProductApplicationComment({
        body: {
          service_provider_product_application_id: sppaId,
          content,
          visibility,
        },
      }).then(throwOnError);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: sppaCommentsQueryKey(sppaId ?? 0),
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
      visibility: ServiceProviderProductApplicationCommentVisibility;
    }) =>
      updateServiceProviderProductApplicationComment({
        path: { id },
        body: { content, visibility },
      }).then(throwOnError),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: sppaCommentsQueryKey(sppaId ?? 0),
      }),
  });

  return { commentsQuery, postComment, editComment };
}
