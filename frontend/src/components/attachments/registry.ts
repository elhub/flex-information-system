import {
  listServiceProvidingGroupProductApplicationAttachment,
  createServiceProvidingGroupProductApplicationAttachment,
  deleteServiceProvidingGroupProductApplicationAttachment,
  callDownloadServiceProvidingGroupProductApplicationAttachment,
} from "../../generated-client";
import { throwOnError } from "../../util";

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
    upload: (parentId: number, file: File) =>
      createServiceProvidingGroupProductApplicationAttachment({
        body: {
          service_providing_group_product_application_id: parentId,
          file,
        },
      }).then(throwOnError),
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
