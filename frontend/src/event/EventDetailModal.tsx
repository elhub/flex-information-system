import { Event } from "../generated-client";
import { BodyText, Button, Modal } from "../components/ui";
import { LabelValue } from "../components/LabelValue";

export const EventDetailModal = ({
  record,
  open,
  onClose,
}: {
  record: Event | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose} aria-label="Event details">
      <Modal.Header title={record.type} />
      <Modal.Content className="grid gap-4 sm:grid-cols-2">
        <LabelValue label="ID" value={record.id} />
        <LabelValue label="Time" value={record.time} />
        <LabelValue label="Source" value={record.source} />
        <LabelValue label="Subject" value={record.subject} />
        <div className="flex flex-col gap-1 sm:col-span-2">
          <BodyText weight="bold">Data:</BodyText>
          <BodyText className="whitespace-pre-wrap break-words">
            {record.data ? JSON.stringify(record.data, null, 2) : "No data"}
          </BodyText>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="tertiary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
