import { Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { KILO, Scale } from "../../../utils/scales";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { useGetAllProductTypes } from "../../../product_type/components";
import { useTranslateEnum } from "../../../intl/intl";

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
  spg: ServiceProvidingGroup | undefined;
  powerScale: Scale;
};

export const SpgpaShowSummary = ({ spgpa, spg, powerScale }: Props) => {
  const translateEnum = useTranslateEnum();

  const productTypes = useGetAllProductTypes();
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
        <div className="flex flex-col gap-4">
          {/* Application fields */}

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
        </div>
      </Panel>
    </div>
  );
};
