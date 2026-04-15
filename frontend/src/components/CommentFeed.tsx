// frontend/src/components/CommentFeed.tsx
import { useState } from "react";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import {
  Button,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  Textarea,
} from "./ui";
import { CommentBubble } from "./CommentBubble";
import type {
  CommentRow,
  PostCommentInput,
} from "../service_providing_group/product_application/show/useSpgpaComments";

type CommentFeedProps = {
  commentsQuery: UseQueryResult<CommentRow[]>;
  postComment: UseMutationResult<unknown, Error, PostCommentInput>;
  canCreate: boolean;
};

export function CommentFeed({
  commentsQuery,
  postComment,
  canCreate,
}: CommentFeedProps) {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<
    "same_party" | "any_involved_party"
  >("same_party");

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
    <div className="flex flex-col">
      {/* Compose area */}
      {canCreate && (
        <div className="p-4 border-b-2 border-gray-200 bg-white">
          <p className="text-sm font-bold text-gray-900 mb-2">New comment</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            rows={4}
          />
          <div className="flex justify-end items-center gap-2 mt-2">
            <Select
              value={visibility}
              onValueChange={(v) =>
                setVisibility(v as "same_party" | "any_involved_party")
              }
              placeholder="Visibility"
            >
              <SelectContent>
                <SelectItem value="same_party">
                  Internal (same party)
                </SelectItem>
                <SelectItem value="any_involved_party">
                  Shared (all involved parties)
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
      <div className="p-4 flex flex-col gap-4 bg-semantic-background-alternative">
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
            <CommentBubble key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
