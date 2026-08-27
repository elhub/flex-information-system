import { BodyText, Button, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { KILO, Scale } from "../../../utils/scales";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { IconExternal, IconPencil } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import type { Permissions } from "../../../auth/permissions";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { useGetAllProductTypes } from "../../../product_type/components";
import { useParty } from "../../../hooks/party";
import {
  EventButton,
  ResourceHistoryButton,
} from "../../../components/EDS-ra/buttons";
import { useTranslateEnum } from "../../../intl/intl";

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
  spg: ServiceProvidingGroup | undefined;
  powerScale: Scale;
};

export const SpgpaShowSummary = ({ spgpa, spg, powerScale }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();
  const canEdit = permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );

  const procuringServiceProvider = useParty(spgpa.procuring_system_operator_id);
  const productTypes = useGetAllProductTypes();
  const navigate = useNavigate();

  if (procuringServiceProvider.error) throw procuringServiceProvider.error;
  const productTypeNames = productTypes
    ?.filter((pt) => spgpa.product_type_ids.includes(pt.id))
    .map((pt) => pt.name)
    .join(", ");

  return (
    <div className="flex flex-col gap-4">
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
          {/* Application fields */}
          <LabelValue
            size="large"
            label="Service providing group"
            value={
              <>
                <BodyText className="mb-2">
                  {spg?.name} (#{spg?.id})
                </BodyText>
                <Button
                  as={RouterLink}
                  onClick={() =>
                    navigate(
                      `/service_providing_group/${spgpa.service_providing_group_id}/show`,
                    )
                  }
                >
                  {"See group"}
                </Button>
              </>
            }
          />

          <LabelValue
            size="large"
            label="System Operator / PSO"
            value={
              <Link
                as={RouterLink}
                to={`/party/${spgpa.procuring_system_operator_id}/show`}
              >
                {procuringServiceProvider.data?.name}
              </Link>
            }
          />

          <LabelValue
            size="large"
            label="Product types"
            value={productTypeNames}
          />
          <LabelValue
            size="large"
            label="Bidding Zone"
            value={spg?.bidding_zone}
          />
          <LabelValue
            size="large"
            label="Max active power (up)"
            value={spgpa.maximum_active_power_up}
            unit="W"
            storageScale={KILO}
            displayScale={powerScale}
          />

          <LabelValue
            size="large"
            label="Max active power (down)"
            value={spgpa.maximum_active_power_down}
            unit="W"
            storageScale={KILO}
            displayScale={powerScale}
          />

          {spgpa.ramping_capability && (
            <LabelValue
              size="large"
              labelKey="service_providing_group_product_application.ramping_capability"
              value={translateEnum(
                `service_providing_group_product_application.ramping_capability.${spgpa.ramping_capability}`,
              )}
            />
          )}

          {spgpa.ramping_description && (
            <LabelValue
              size="large"
              labelKey="service_providing_group_product_application.ramping_description"
              value={
                <span className="whitespace-pre-wrap">
                  {spgpa.ramping_description}
                </span>
              }
            />
          )}

          <LabelValue
            size="large"
            label="Prequalified at"
            value={spgpa.prequalified_at}
          />
          <LabelValue
            size="large"
            label="Verified at"
            value={spgpa.verified_at}
          />

          {spgpa.additional_information && (
            <LabelValue
              label="Additional information"
              value={
                <span className="whitespace-pre-wrap">
                  {spgpa.additional_information}
                </span>
              }
            />
          )}
        </div>
      </Panel>
      <div className="flex gap-4 mt-2">
        <ResourceHistoryButton id={String(spgpa.id)} />
        <EventButton filterOnSubject recordId={String(spgpa.id)} />
        <Button
          as={RouterLink}
          to={`/service_providing_group_product_application/${spgpa.id}/print`}
          target="_blank"
          rel="noopener noreferrer"
          variant="invisible"
          icon={IconExternal}
        >
          Print
        </Button>
      </div>
    </div>
  );
};
