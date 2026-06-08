import { useTranslate } from "ra-core";
import { BodyText, Button, Heading, Modal } from "../../components/ui";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { type CuWithMembership } from "./useSpgMemberships";

type Props = {
  open: boolean;
  onClose: () => void;
  toAddCUs: CuWithMembership[];
  toRemoveCUs: CuWithMembership[];
  columns: Column<CuWithMembership>[];
};

export const ReviewModal = ({
  open,
  onClose,
  toAddCUs,
  toRemoveCUs,
  columns,
}: Props) => {
  const translate = useTranslate();
  const hasNoChanges = toAddCUs.length === 0 && toRemoveCUs.length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-label={translate("text.spg_manage_members_review_modal_title")}
      className="max-w-4xl"
    >
      <Modal.Header
        title={translate("text.spg_manage_members_review_modal_title")}
        description={translate(
          "text.spg_manage_members_review_modal_description",
        )}
      />
      <Modal.Content>
        {hasNoChanges && (
          <BodyText>
            {translate("text.spg_manage_members_review_modal_no_changes")}
          </BodyText>
        )}
        {toAddCUs.length > 0 && (
          <div className="mb-6">
            <Heading level={4} size="xsmall" className="mb-2">
              {toAddCUs.length !== 1
                ? translate(
                    "text.spg_manage_members_review_modal_adding_plural",
                    { count: toAddCUs.length },
                  )
                : translate(
                    "text.spg_manage_members_review_modal_adding_singular",
                  )}
            </Heading>
            <SimpleTable size="small" data={toAddCUs} columns={columns} />
          </div>
        )}
        {toRemoveCUs.length > 0 && (
          <div>
            <Heading level={4} size="xsmall" className="mb-2">
              {toRemoveCUs.length !== 1
                ? translate(
                    "text.spg_manage_members_review_modal_removing_plural",
                    { count: toRemoveCUs.length },
                  )
                : translate(
                    "text.spg_manage_members_review_modal_removing_singular",
                  )}
            </Heading>
            <SimpleTable size="small" data={toRemoveCUs} columns={columns} />
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {translate("text.spg_manage_members_review_modal_close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
