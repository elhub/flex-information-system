// frontend/src/components/CommentBubble.tsx
import type { CommentRow } from "../service_providing_group/product_application/show/useSpgpaComments";

const AVATAR_COLORS = [
  { bg: "bg-indigo-200", text: "text-indigo-900" },
  { bg: "bg-green-200", text: "text-green-900" },
  { bg: "bg-violet-200", text: "text-violet-900" },
  { bg: "bg-amber-200", text: "text-amber-900" },
  { bg: "bg-pink-200", text: "text-pink-900" },
  { bg: "bg-cyan-200", text: "text-cyan-900" },
];

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
  comment: CommentRow;
};

export function CommentBubble({ comment }: CommentBubbleProps) {
  const color = AVATAR_COLORS[comment.authorId % AVATAR_COLORS.length];
  const isInternal = comment.visibility === "same_party";

  return (
    <div className="flex gap-3 items-start">
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color.bg} ${color.text}`}
      >
        {comment.authorInitials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-bold text-gray-900">
            {comment.authorName}
          </span>
          {comment.authorParty && (
            <span className="text-xs text-gray-500">{comment.authorParty}</span>
          )}
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
          {isInternal ? (
            <span className="text-xs bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 font-semibold">
              Internal
            </span>
          ) : (
            <span className="text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5 font-semibold">
              Shared
            </span>
          )}
        </div>

        {/* Body */}
        <div
          className={`rounded-tr-lg rounded-b-lg border px-3 py-2.5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${
            comment.isCurrentUser
              ? "bg-blue-50 border-blue-200"
              : "bg-white border-gray-200"
          }`}
        >
          {comment.content}
        </div>
      </div>
    </div>
  );
}
