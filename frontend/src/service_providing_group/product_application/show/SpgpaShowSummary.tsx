import { ComponentType } from "react";
import {
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
  IconWarningCircle,
  SvgIconProps,
} from "@elhub/ds-icons";
import { Badge, Button, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { Link as RouterLink } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import { Permissions } from "../../../auth/permissions";
import { useTranslateEnum } from "../../../intl/intl";
import {
  ServiceProvidingGroupProductApplication,
  ServiceProvidingGroupProductApplicationStatus,
} from "../../../generated-client";
import { ProductTypeArrayField } from "../../../product_type/components";
import { RecordContextProvider } from "ra-core";
import { DateField } from "../../../components/datetime";

const statusVariantMap: Record<
  ServiceProvidingGroupProductApplicationStatus,
  {
    status:
      | "ongoing"
      | "failed"
      | "approved-with-warning"
      | "approved"
      | "stopped"
      | "temporarily-stopped"
      | "pending"
      | "rejected";
    icon: ComponentType<SvgIconProps>;
  }
> = {
  requested: { status: "pending", icon: IconStopWatch15 },
  prequalification_pending: { status: "ongoing", icon: IconStopWatch15 },
  in_progress: { status: "ongoing", icon: IconStopWatch15 },
  temporary_qualified: {
    status: "approved-with-warning",
    icon: IconWarningCircle,
  },
  prequalified: { status: "approved", icon: IconQualitiesCircle },
  verified: { status: "approved", icon: IconQualitiesCircle },
  rejected: { status: "rejected", icon: IconCrossCircle },
};

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
};

export const SpgpaShowSummary = ({ spgpa }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();
  const canEdit = permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );

  const { status, icon } = statusVariantMap[spgpa.status];

  return (
    <Panel
      border
      className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
    >
      {canEdit && (
        <div className="flex justify-end">
          <Button
            as={RouterLink}
            to={`/service_providing_group/${spgpa.service_providing_group_id}/product_application/${spgpa.id}`}
            variant="invisible"
            icon={IconPencil}
          >
            Edit
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <RecordContextProvider value={spgpa}>
          {/* Application fields */}
          <LabelValue
            size="small"
            label="Service providing group"
            value={
              <Link
                as={RouterLink}
                to={`/service_providing_group/${spgpa.service_providing_group_id}/show`}
              >
                #{spgpa.service_providing_group_id}
              </Link>
            }
          />
          <LabelValue
            size="small"
            label="System Operator / PSO"
            value={spgpa.procuring_system_operator_id}
          />
          <ProductTypeArrayField
            label="Product types"
            source="product_type_ids"
          />
          <LabelValue
            size="small"
            label="Max active power"
            value={spgpa.maximum_active_power}
            unit="kW"
          />

          <hr className="border-semantic-border-default" />

          {/* Application process fields */}
          <Badge size="small" status={status} variant="block" icon={icon}>
            {translateEnum(
              `service_providing_group_product_application.status.${spgpa.status}`,
            )}
          </Badge>
          <DateField
            source="prequalified_at"
            showTime
            label="field.service_providing_group_product_application.prequalified_at"
          />
          <DateField
            source="verified_at"
            showTime
            label="field.service_providing_group_product_application.verified_at"
          />
          {spgpa.additional_information && (
            <LabelValue
              label="Additional information"
              value={spgpa.additional_information}
            />
          )}

          <hr className="border-semantic-border-default" />

          {/* Registration */}
          <DateField
            source="recorded_at"
            showTime
            label="field.service_providing_group_product_application.recorded_at"
          />
        </RecordContextProvider>
      </div>
    </Panel>
  );
};
