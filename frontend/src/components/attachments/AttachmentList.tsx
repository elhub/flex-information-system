import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "ra-core";
import { IconDownload, IconUpload, IconCross } from "@elhub/ds-icons";
import { Button, Loader } from "../ui";
import { useConfirmAction } from "../ConfirmAction";
import { IconDocument, IconImage } from "./icons";
import type { Attachment } from "./types";
import type { Permissions, PermissionTarget } from "../../auth/permissions";
import { apiURL, API_VERSION } from "../../httpConfig";

// helpers

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("no-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// fetch file from backend and trigger a browser download
async function triggerDownload(downloadUrl: string, fileName: string) {
  const response = await fetch(downloadUrl, {
    credentials: "include",
    headers: { "Api-Version": API_VERSION },
  });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const blob = await response.blob();

  // temporary object URL that will allow downloading without changing pages
  const objectUrl = URL.createObjectURL(blob);

  // add download link, click it, remove it
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(objectUrl);
}

// thin fetch wrapper that always sends credentials and the Api-Version header
// TODO: replace calls with API client once attachments are automated
async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Api-Version": API_VERSION,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `API error ${response.status} ${response.statusText}${detail ? `: ${detail}` : ""}`,
    );
  }
  return response;
}

// AttachmentCard (component showing each attachment in the list)

type AttachmentCardProps = {
  attachment: Attachment;
  downloadUrl: string;
  onDelete: () => Promise<void>;
  canDelete: boolean;
};

function AttachmentCard({
  attachment,
  downloadUrl,
  onDelete,
  canDelete,
}: AttachmentCardProps) {
  const [downloadHovered, setDownloadHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const isImage = attachment.content_type.startsWith("image/");

  async function handleDownload() {
    setDownloadError(false);
    setIsDownloading(true);
    try {
      await triggerDownload(downloadUrl, attachment.filename);
    } catch {
      setDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  }

  // confirm popup on delete to ensure no accidental delete is possible
  const { buttonProps: deleteButtonProps, dialog: deleteDialog } =
    useConfirmAction({
      title: "Delete attachment",
      content: (
        <span>
          Are you sure you want to delete <strong>{attachment.filename}</strong>
          ? This action cannot be undone.
        </span>
      ),
      onConfirmMutation: { mutationFn: onDelete },
    });

  // red cross for delete button, negative effect on hover (white on red)
  const deleteStyle: React.CSSProperties = deleteHovered
    ? {
        color: "white",
        backgroundColor: "var(--eds-semantic-background-action-danger)",
        borderRadius: "0.375rem",
      }
    : {
        color: "var(--eds-semantic-background-action-danger)",
        backgroundColor: "transparent",
        borderRadius: "0.375rem",
      };

  return (
    <div
      style={{ backgroundColor: "var(--eds-global-color-white)" }}
      className="flex items-center gap-3 px-4 py-3 border border-solid border-semantic-border-default rounded-md"
    >
      {/* file-type icon button, switches to download icon on hover */}
      <button
        type="button"
        aria-label={`Download ${attachment.filename}`}
        onMouseEnter={() => setDownloadHovered(true)}
        onMouseLeave={() => setDownloadHovered(false)}
        onClick={handleDownload}
        disabled={isDownloading}
        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-md text-semantic-text-subtle hover:text-semantic-background-action-primary hover:bg-semantic-background-action-selected transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
      >
        {downloadHovered ? (
          <IconDownload size="medium" />
        ) : isImage ? (
          <IconImage size="medium" />
        ) : (
          <IconDocument size="medium" />
        )}
      </button>

      {/* name + metadata */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-semantic-text truncate">
          {attachment.filename}
        </p>
        <p className="text-xs text-semantic-text-subtle truncate">
          {attachment.content_type} · {formatBytes(attachment.size_bytes)} ·{" "}
          {formatDate(attachment.recorded_at)}
        </p>
        {downloadError && (
          <p className="text-xs text-semantic-text-error mt-0.5">
            Download failed. Please try again.
          </p>
        )}
      </div>

      {/* delete button */}
      {canDelete && (
        <>
          <button
            type="button"
            aria-label={`Delete ${attachment.filename}`}
            style={deleteStyle}
            onMouseEnter={() => setDeleteHovered(true)}
            onMouseLeave={() => setDeleteHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              deleteButtonProps.onClick();
            }}
            className="shrink-0 flex items-center justify-center w-6 h-6 transition-colors cursor-pointer"
          >
            <IconCross size="small" />
          </button>
          {deleteDialog}
        </>
      )}
    </div>
  );
}

// UploadArea (zone under the list to upload a new attachment)

type UploadAreaProps = {
  onUpload: (file: File) => void;
  isPending: boolean;
  isError: boolean;
};

function UploadArea({ onUpload, isPending, isError }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
  }

  function handleUpload() {
    if (!selectedFile) return;
    onUpload(selectedFile);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t-2">
      {/* invisible file input component at first, made visible only when
          clicking on the file picker button */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpeg,.jpg,.png"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute w-0 h-0 opacity-0 overflow-hidden pointer-events-none"
        onChange={handleFileChange}
      />

      {/* file picker button */}
      <Button
        variant="secondary"
        size="medium"
        icon={IconUpload}
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        Choose file
      </Button>

      {/* selected file name */}
      <span className="flex-1 text-sm text-semantic-text truncate">
        {selectedFile ? (
          selectedFile.name
        ) : (
          <span className="text-semantic-text-subtle">
            No file selected · PDF, JPEG or PNG
          </span>
        )}
      </span>

      {/* upload button */}
      <Button
        variant="primary"
        size="medium"
        onClick={handleUpload}
        disabled={!selectedFile || isPending}
      >
        {isPending ? "Uploading…" : "Upload"}
      </Button>

      {isError && (
        <p className="text-sm text-semantic-text-error">
          Upload failed. Please try again.
        </p>
      )}
    </div>
  );
}

// AttachmentList (the whole component: all attachments + upload area)

export type AttachmentListProps = {
  resource: string;
  parentId: number | undefined;
};

export function AttachmentList({ resource, parentId }: AttachmentListProps) {
  const queryClient = useQueryClient();
  const { permissions } = usePermissions<Permissions>();

  const parentField = `${resource}_id`;

  const queryKey = [`${resource}_attachment`, parentId];

  const attachmentsQuery = useQuery<Attachment[]>({
    queryKey,
    queryFn: async () => {
      const response = await apiFetch(
        `${apiURL}/${resource}_attachment?${parentField}=eq.${parentId}`,
        { headers: { Accept: "application/json" } },
      );
      return response.json();
    },
    enabled: !!parentId,
  });

  const uploadAttachment = useMutation<unknown, Error, File>({
    mutationFn: async (file: File) => {
      if (!parentId) throw new Error("No parentId");
      const body = new FormData();
      body.append(parentField, String(parentId));
      body.append("file", file, file.name);
      const response = await apiFetch(`${apiURL}/${resource}_attachment`, {
        method: "POST",
        body,
      });
      return response.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteAttachment = useMutation<unknown, Error, number>({
    mutationFn: async (attachmentId: number) => {
      await apiFetch(`${apiURL}/${resource}_attachment/${attachmentId}`, {
        method: "DELETE",
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const canCreate =
    permissions?.allow(
      `${resource}_attachment` as PermissionTarget,
      "create",
    ) ?? false;
  const canDelete =
    permissions?.allow(
      `${resource}_attachment` as PermissionTarget,
      "delete",
    ) ?? false;

  const downloadUrl = (attachmentId: number) =>
    `${apiURL}/${resource}_attachment/${attachmentId}/download`;

  if (attachmentsQuery.error) throw attachmentsQuery.error;

  return (
    <div className="flex flex-col max-w-4xl">
      <div className="p-4 flex flex-col gap-2">
        {attachmentsQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : attachmentsQuery.data?.length === 0 ? (
          <p className="text-center text-sm text-semantic-text-subtle py-8">
            No attachments yet.
          </p>
        ) : (
          attachmentsQuery.data?.map((attachment) => (
            <AttachmentCard
              key={attachment.id}
              attachment={attachment}
              downloadUrl={downloadUrl(attachment.id)}
              onDelete={() =>
                deleteAttachment.mutateAsync(attachment.id).then(() => {})
              }
              canDelete={canDelete}
            />
          ))
        )}
      </div>
      {canCreate && (
        <UploadArea
          onUpload={(file) =>
            uploadAttachment.mutate(file, {
              onSuccess: () => {},
            })
          }
          isPending={uploadAttachment.isPending}
          isError={uploadAttachment.isError}
        />
      )}
    </div>
  );
}
