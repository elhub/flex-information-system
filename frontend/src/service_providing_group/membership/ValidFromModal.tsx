import {
  BodyText,
  Button,
  Datepicker,
  FormItem,
  FormItemLabel,
  Modal,
} from "../../components/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  toAddCount: number;
  validFrom: Date;
  setValidFrom: (date: Date) => void;
  isApplying: boolean;
  onConfirm: () => void;
};

export const ValidFromModal = ({
  open,
  onClose,
  toAddCount,
  validFrom,
  setValidFrom,
  isApplying,
  onConfirm,
}: Props) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-label="Set membership start date"
    className="overflow-visible"
  >
    <Modal.Header
      title="Set membership start date"
      description={`Adding ${toAddCount} controllable unit${toAddCount !== 1 ? "s" : ""} to the group.`}
    />
    <Modal.Content>
      <BodyText>
        Choose the date from which the new memberships are valid.
      </BodyText>
      <FormItem>
        <FormItemLabel htmlFor="valid-from-picker">Valid from</FormItemLabel>
        <Datepicker
          id="valid-from-picker"
          selected={validFrom}
          onChange={(date) => date && setValidFrom(date)}
          size="large"
          navigateButtons={false}
        />
      </FormItem>
    </Modal.Content>
    <Modal.Footer>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" disabled={isApplying} onClick={onConfirm}>
        Confirm
      </Button>
    </Modal.Footer>
  </Modal>
);
