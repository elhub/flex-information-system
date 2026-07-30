import {
  listServiceProvidingGroupProductApplicationAttachment,
  createServiceProvidingGroupProductApplicationAttachment,
  deleteServiceProvidingGroupProductApplicationAttachment,
  callDownloadServiceProvidingGroupProductApplicationAttachment,
} from "../../generated-client";
import { throwOnError } from "../../util";

const enc = new TextEncoder();

// create raw multipart form body
// used to be able to set the boundary, which is not possible with FormData
// (the WAF seems not to like the default boundary)
async function buildMultipartBlob(
  id: number,
  file: File,
  boundary: string,
): Promise<Blob> {
  const dash = "--";
  const crlf = "\r\n";
  const fileBytes = await file.arrayBuffer();

  const parts: BlobPart[] = [
    enc.encode(
      `${dash}${boundary}${crlf}` +
        `Content-Disposition: form-data; name="service_providing_group_product_application_id"${crlf}` +
        `${crlf}` +
        `${id}${crlf}`,
    ),
    enc.encode(
      `${dash}${boundary}${crlf}` +
        `Content-Disposition: form-data; name="file"; filename="${file.name}"${crlf}` +
        (file.type ? `Content-Type: ${file.type}${crlf}` : "") +
        `${crlf}`,
    ),
    fileBytes,
    enc.encode(`${crlf}${dash}${boundary}${dash}${crlf}`),
  ];

  return new Blob(parts);
}

// generic fetch functions for a given attachment resource
export type AttachmentClient = {
  list: (parentId: number) => Promise<AttachmentItem[]>;
  upload: (parentId: number, file: File) => Promise<unknown>;
  delete: (attachmentId: number) => Promise<unknown>;
  download: (attachmentId: number) => Promise<Blob>;
};

// common shape shared by all attachment resources
export type AttachmentItem = {
  id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  recorded_at: string;
};

// resource |-> generated API client calls
export const attachmentRegistry = {
  service_providing_group_product_application: {
    list: (parentId: number) =>
      listServiceProvidingGroupProductApplicationAttachment({
        query: {
          service_providing_group_product_application_id: `eq.${parentId}`,
        },
      }).then(throwOnError),
    upload: async (parentId: number, file: File) => {
      // generate a boundary that will be accepted by the WAF
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const random = Array.from(
        { length: 24 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
      const boundary = "------------------------" + random;

      // create the body
      const blob = await buildMultipartBlob(parentId, file, boundary);

      // call the generated API client overriding the body and boundary
      return createServiceProvidingGroupProductApplicationAttachment({
        body: {} as never,
        bodySerializer: () => blob,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
      }).then(throwOnError);
    },
    delete: (attachmentId: number) =>
      deleteServiceProvidingGroupProductApplicationAttachment({
        path: { id: attachmentId },
      }).then(throwOnError),
    download: (attachmentId: number) =>
      callDownloadServiceProvidingGroupProductApplicationAttachment({
        path: { id: attachmentId },
        parseAs: "blob",
      }).then(throwOnError) as Promise<Blob>,
  },
} satisfies Record<string, AttachmentClient>;

export type AttachmentResource = keyof typeof attachmentRegistry;
