import { usePermissions } from "ra-core";
import { useNavigate } from "react-router-dom";
import { TechnicalResource } from "../../generated-client";
import { Button, Modal, Tag } from "../../components/ui";
import { IconPencil } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { useTranslateEnum } from "../../intl/intl";
import { EnumLabel } from "../../intl/enum-labels";
import { LabelValue } from "../../components/LabelValue";

export const TechnicalResourceDetailModal = ({
  record,
  open,
  onClose,
}: {
  record: TechnicalResource | null;
  open: boolean;
  onClose: () => void;
}) => {
  const translateEnum = useTranslateEnum();
  const navigate = useNavigate();
  const { permissions } = usePermissions<Permissions>();

  if (!record) return null;

  const canEdit = permissions?.allow("technical_resource", "update");

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-label="Technical resource details"
    >
      <Modal.Header title={record.name ?? `Technical resource ${record.id}`} />
      <Modal.Content className="grid grid-cols-2 min-w-2xl gap-2">
        <LabelValue
          className="contents"
          labelKey="technical_resource.id"
          value={record.id}
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.name"
          value={record.name}
        />

        <LabelValue
          className="contents"
          labelKey="technical_resource.technology"
          value={
            <div className="flex gap-2 flex-wrap">
              {record.technology.map((v) => (
                <Tag key={v}>
                  {translateEnum(`technology.${v}` as EnumLabel)}
                </Tag>
              ))}
            </div>
          }
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.category"
          value={
            <div className="flex gap-2 flex-wrap">
              {record.category.map((v) => (
                <Tag key={v}>{translateEnum(`category.${v}` as EnumLabel)}</Tag>
              ))}
            </div>
          }
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.maximum_active_power"
          value={record.maximum_active_power}
          unit="kW"
        />

        <LabelValue
          className="contents"
          labelKey="technical_resource.device_type"
          value={translateEnum(
            `device_type.${record.device_type}` as EnumLabel,
          )}
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.make"
          value={record.make}
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.model"
          value={record.model}
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.business_id"
          value={record.business_id}
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.business_id_type"
          value={
            record.business_id_type
              ? translateEnum(
                  `technical_resource.business_id_type.${record.business_id_type}` as EnumLabel,
                )
              : undefined
          }
        />
        <LabelValue
          className="contents"
          labelKey="technical_resource.additional_information"
          value={record.additional_information}
        />
      </Modal.Content>
      <Modal.Footer>
        {canEdit && (
          <Button
            variant="secondary"
            icon={IconPencil}
            onClick={() => {
              onClose();
              navigate(
                `/controllable_unit/${record.controllable_unit_id}/technical_resource/${record.id}`,
              );
            }}
          >
            Edit
          </Button>
        )}
        <Button variant="tertiary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
