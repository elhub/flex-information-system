import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import {
  createServiceProvidingGroupProductApplicationComment,
  listIdentity,
  listServiceProvidingGroupProductApplicationComment,
} from "../../../generated-client";
import { throwOnError } from "../../../util";

export type CommentRow = {
  id: number;
  authorId: number;
  content: string;
  visibility: "same_party" | "any_involved_party";
  createdAt: string;
  authorName: string;
  authorParty: string;
  authorInitials: string;
  isCurrentUser: boolean;
};

export type PostCommentInput = {
  content: string;
  visibility: "same_party" | "any_involved_party";
};

const spgpaCommentsQueryKey = (spgpaId: number) => ["spgpa_comments", spgpaId];

function deriveInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

async function fetchSpgpaComments(
  spgpaId: number,
  currentEntityId: number | undefined,
): Promise<CommentRow[]> {
  const comments = await listServiceProvidingGroupProductApplicationComment({
    query: {
      service_providing_group_product_application_id: `eq.${spgpaId}`,
      order: "created_at.asc",
    },
  }).then(throwOnError);

  if (comments.length === 0) return [];

  const uniqueIdentityIds = [...new Set(comments.map((c) => c.created_by))];

  const identities = await listIdentity({
    query: { id: `in.(${uniqueIdentityIds.join(",")})` },
  }).then(throwOnError);

  const identityMap = Object.fromEntries(identities.map((i) => [i.id, i]));

  return comments.map((c) => {
    const identity = identityMap[c.created_by];
    const authorName = identity?.entity_name ?? String(c.created_by);
    return {
      id: c.id,
      authorId: c.created_by,
      content: c.content,
      visibility: c.visibility,
      createdAt: c.created_at,
      authorName,
      authorParty: identity?.party_name ?? "",
      authorInitials: deriveInitials(authorName),
      isCurrentUser: identity?.entity_id === currentEntityId,
    };
  });
}

export function useSpgpaComments(spgpaId: number) {
  const queryClient = useQueryClient();
  const { data: identity } = useGetIdentity();
  const currentEntityId = identity?.entityID as number | undefined;

  const commentsQuery = useQuery({
    queryKey: spgpaCommentsQueryKey(spgpaId),
    queryFn: () => fetchSpgpaComments(spgpaId, currentEntityId),
    enabled: !!spgpaId,
  });

  const postComment = useMutation({
    mutationFn: ({ content, visibility }: PostCommentInput) =>
      createServiceProvidingGroupProductApplicationComment({
        body: {
          service_providing_group_product_application_id: spgpaId,
          content,
          visibility,
        },
      }).then(throwOnError),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: spgpaCommentsQueryKey(spgpaId),
      }),
  });

  return { commentsQuery, postComment };
}
