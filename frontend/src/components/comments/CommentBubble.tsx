// frontend/src/components/CommentBubble.tsx
import { useState } from "react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  Tag,
  Textarea,
  Tooltip,
} from "../ui";
import { IconViewOff, IconViewOn, IconPencil } from "@elhub/ds-icons";
import type { Identity } from "../../generated-client/types.gen";
import { Comment, Visibility } from "./types";
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
  createdByIdentity: Identity | undefined;
  recordedByIdentity: Identity | undefined;
  isCurrentUser: boolean;
  onEdit?: (
    id: number,
    content: string,
    visibility: Visibility,
  ) => Promise<unknown>;
};

export function CommentBubble({
  comment,
  createdByIdentity: identity,
  recordedByIdentity,
  isCurrentUser,
  onEdit,
}: CommentBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(comment.content ?? "");
  const [draftVisibility, setDraftVisibility] = useState<Visibility>(
    comment.visibility as Visibility,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const isRestrictedVisibility = isEditing
    ? draftVisibility !== "any_involved_party"
    : comment.visibility !== "any_involved_party";
  const authorName = identity?.entity_name ?? String(comment.created_by);
  const isEdited = comment.recorded_at !== comment.created_at;
  const updatedByName =
    recordedByIdentity?.entity_name ?? String(comment.recorded_by);
  const enumTranslation = useTranslateEnum();
  const translate = useTranslate();
  const bodyClass = `border-b px-3 py-1 text-base text-gray-700 leading-relaxed whitespace-pre-wrap ${
    isCurrentUser ? "bg-semantic-background-action-selected" : "bg-white"
  }`;

  function handleEdit() {
    setDraftContent(comment.content ?? "");
    setDraftVisibility(comment.visibility as Visibility);
    setSaveError(false);
    setIsEditing(true);
  }

  async function handleSave() {
    if (!draftContent.trim() || !onEdit) return;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onEdit(comment.id, draftContent.trim(), draftVisibility);
      setIsEditing(false);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setSaveError(false);
  }

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
        {isEdited && (
          <>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">
              Updated by {updatedByName} at {formatDate(comment.recorded_at)}
            </span>
          </>
        )}
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
        {isCurrentUser && onEdit && !isEditing && (
          <Button
            variant="invisible"
            size="medium"
            icon={IconPencil}
            onClick={handleEdit}
            className="ml-auto"
          >
            Edit
          </Button>
        )}
      </div>

      {/* Body */}
      {isEditing ? (
        <div className="flex flex-col gap-2 border-b px-3 py-2 bg-semantic-background-action-selected">
          <Textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={3}
          />
          {saveError && (
            <p className="text-sm text-red-600">
              Failed to save comment. Please try again.
            </p>
          )}
          <div className="flex justify-end items-center gap-2">
            <Select
              className="w-80"
              value={draftVisibility}
              onValueChange={(v) => setDraftVisibility(v as Visibility)}
              placeholder="Visibility"
            >
              <SelectContent>
                <SelectItem value="same_party">
                  <span className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">
                      <IconViewOff size="small" />
                    </span>
                    <span className="flex flex-col">
                      <span>
                        {enumTranslation("comment.visibility.same_party")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {translate(
                          "text.comment.visibility.same_party.description",
                        )}
                      </span>
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="any_involved_party">
                  <span className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">
                      <IconViewOn size="small" />
                    </span>
                    <span className="flex flex-col">
                      <span>
                        {enumTranslation(
                          "comment.visibility.any_involved_party",
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {translate(
                          "text.comment.visibility.any_involved_party.description",
                        )}
                      </span>
                    </span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || !draftContent.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className={bodyClass}>{comment.content}</div>
      )}
    </div>
  );
}
