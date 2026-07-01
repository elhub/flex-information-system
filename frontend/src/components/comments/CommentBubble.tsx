// frontend/src/components/CommentBubble.tsx
import { Tag, Tooltip } from "../ui";
import { IconViewOff, IconViewOn } from "@elhub/ds-icons";
import type { Identity } from "../../generated-client/types.gen";
import { Comment } from "./types";
import { useTranslateEnum } from "../../intl/intl";
import { useTranslate } from "ra-core";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type CommentBubbleProps = {
  comment: Comment;
  identity: Identity | undefined;
  isCurrentUser: boolean;
};

export function CommentBubble({
  comment,
  identity,
  isCurrentUser,
}: CommentBubbleProps) {
  const isRestrictedVisibility = comment.visibility !== "any_involved_party";
  const authorName = identity?.entity_name ?? String(comment.created_by);
  const enumTranslation = useTranslateEnum();
  const translate = useTranslate();
  const bodyClass = `border-b px-3 py-1 text-base text-gray-700 leading-relaxed whitespace-pre-wrap ${
    isCurrentUser ? "bg-semantic-background-action-selected" : "bg-white"
  }`;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-900">{authorName}</span>
        {identity?.party_name && (
          <>
            <span className="text-xs text-gray-500">{identity.party_name}</span>
            <span className="text-xs text-gray-400">·</span>
          </>
        )}
        <span className="text-xs text-gray-400">
          {formatDate(comment.created_at)}
        </span>
        {isRestrictedVisibility ? (
          <Tooltip
            content={translate(
              "text.comment.visibility.same_party.description",
            )}
            placement="top"
          >
            <span>
              <Tag size="small" variant="warning">
                <span className="flex items-center gap-1">
                  <IconViewOff size="small" />
                  {enumTranslation("comment.visibility.same_party")}
                </span>
              </Tag>
            </span>
          </Tooltip>
        ) : (
          <Tooltip
            content={translate(
              "text.comment.visibility.any_involved_party.description",
            )}
            placement="top"
          >
            <span>
              <Tag size="small" variant="success">
                <span className="flex items-center gap-1">
                  <IconViewOn size="small" />
                  {enumTranslation("comment.visibility.any_involved_party")}
                </span>
              </Tag>
            </span>
          </Tooltip>
        )}
      </div>

      {/* Body */}
      <div className={bodyClass}>{comment.content}</div>
    </div>
  );
}
