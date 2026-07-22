import { Comment } from "../../../components/comments/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  comments: Comment[];
};

export const SpgpaPrintComments = ({ comments }: Props) => {
  const visibleComments = comments.filter(
    (c) => c.visibility === "any_involved_party",
  );

  if (visibleComments.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No comments.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {visibleComments.map((comment) => (
        <div key={comment.id} className="flex flex-col border-b pb-4">
          <span className="text-xs text-gray-400 mb-1">
            {formatDate(comment.created_at)}
          </span>
          <div className="text-base text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </div>
        </div>
      ))}
    </div>
  );
};
