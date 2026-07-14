export type Attachment = {
  id: number;
  filename: string;
  filename_sanitised: string;
  content_type: string;
  size_bytes: number;
  recorded_at: string;
  recorded_by: number;
};
