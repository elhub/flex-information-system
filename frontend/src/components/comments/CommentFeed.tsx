// frontend/src/components/CommentFeed.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetIdentity } from "ra-core";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import {
  Button,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  Textarea,
} from "../ui";
import { CommentBubble } from "./CommentBubble";
import { listIdentity } from "../../generated-client";
import type { Identity } from "../../generated-client/types.gen";
import { throwOnError } from "../../util";
import { Comment, Visibility } from "./types";
import { useTranslateEnum } from "../../intl/intl";

type PostInput = {
  content: string;
  visibility: Visibility;
};

type CommentFeedProps = {
  commentsQuery: UseQueryResult<Comment[]>;
  postComment: UseMutationResult<unknown, Error, PostInput>;
  canCreate: boolean;
};

function useIdentityMap(
  comments: Comment[] | undefined,
): Record<number, Identity> {
  const ids = [...new Set((comments ?? []).map((c) => c.created_by))].sort(
    (a, b) => a - b,
  );

  const { data } = useQuery({
    queryKey: ["identities", ids],
    queryFn: () =>
      listIdentity({ query: { id: `in.(${ids.join(",")})` } }).then(
        throwOnError,
      ),
    enabled: ids.length > 0,
  });

  return Object.fromEntries((data ?? []).map((i) => [i.id, i]));
}

export function CommentFeed({
  commentsQuery,
  postComment,
  canCreate,
}: CommentFeedProps) {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("same_party");

  const { data: identity } = useGetIdentity();
  const currentEntityId =
    identity?.entityID !== undefined ? Number(identity.entityID) : undefined;

  const identityMap = useIdentityMap(commentsQuery.data);
  const enumTranslation = useTranslateEnum();

  if (commentsQuery.error) throw commentsQuery.error;

  function handlePost() {
    if (!text.trim()) return;
    postComment.mutate(
      { content: text.trim(), visibility },
      {
        onSuccess: () => {
          setText("");
          setVisibility("same_party");
        },
      },
    );
  }

  return (
    <div className="flex flex-col max-w-4xl">
      {/* Compose area */}
      {canCreate && (
        <div className="p-4 border-b-2 border-gray-200">
          <p className="text-sm font-bold text-gray-900 mb-2">New comment</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
          />
          {postComment.isError && (
            <p className="text-sm text-red-600 mt-1">
              Failed to post comment. Please try again.
            </p>
          )}
          <div className="flex justify-end items-center gap-2 mt-2">
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as Visibility)}
              placeholder="Visibility"
            >
              <SelectContent>
                <SelectItem value="same_party">
                  {enumTranslation("comment.visibility.same_party")}
                </SelectItem>
                <SelectItem value="any_involved_party">
                  {enumTranslation("comment.visibility.any_involved_party")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="primary"
              onClick={handlePost}
              disabled={postComment.isPending || !text.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="p-4 flex flex-col gap-6">
        {commentsQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : commentsQuery.data?.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            No comments yet.
          </p>
        ) : (
          commentsQuery.data?.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              identity={identityMap[comment.created_by]}
              isCurrentUser={
                identityMap[comment.created_by]?.entity_id === currentEntityId
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
