// frontend/src/components/CommentBubble.tsx
import { Tag } from "./ui";
import type {
  ServiceProvidingGroupProductApplicationComment,
  Identity,
} from "../generated-client/types.gen";

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
  comment: ServiceProvidingGroupProductApplicationComment;
  identity: Identity | undefined;
  isCurrentUser: boolean;
};

export function CommentBubble({
  comment,
  identity,
  isCurrentUser,
}: CommentBubbleProps) {
  const isInternal = comment.visibility === "same_party";
  const authorName = identity?.entity_name ?? String(comment.created_by);

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
        {isInternal ? (
          <Tag size="small" variant="warning">
            Internal
          </Tag>
        ) : (
          <Tag size="small" variant="success">
            Shared
          </Tag>
        )}
      </div>

      {/* Body */}
      <div className={bodyClass}>{comment.content}</div>
    </div>
  );
}
