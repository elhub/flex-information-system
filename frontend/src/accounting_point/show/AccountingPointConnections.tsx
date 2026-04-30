import { MeteringGridArea, Party } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { useTranslate } from "ra-core";

export const AccountingPointConnections = ({
  biddingZone,
  balanceResponsibleParty,
  endUser,
  energySupplier,
  systemOperator,
  meteringGridArea,
}: {
  biddingZone: string | undefined;
  balanceResponsibleParty: Party | undefined;
  endUser: Party | undefined;
  energySupplier: Party | undefined;
  systemOperator: Party | undefined;
  meteringGridArea: MeteringGridArea | undefined;
}) => {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-4">
      <LabelValue
        size="small"
        labelKey="accounting_point_balance_responsible_party.balance_responsible_party_id"
        value={balanceResponsibleParty?.name}
      />
      <LabelValue
        size="small"
        labelKey="accounting_point_bidding_zone.bidding_zone"
        value={
          biddingZone
            ? translate(
                `enum.accounting_point_bidding_zone.bidding_zone.${biddingZone}`,
              )
            : undefined
        }
      />
      <LabelValue
        size="small"
        labelKey="accounting_point_end_user.end_user_id"
        value={endUser?.name}
      />
      <LabelValue
        size="small"
        labelKey="accounting_point_energy_supplier.energy_supplier_id"
        value={energySupplier?.name}
      />
      <LabelValue
        size="small"
        labelKey="accounting_point_metering_grid_area.metering_grid_area_id"
        value={meteringGridArea?.name}
      />
      <LabelValue
        size="small"
        labelKey="accounting_point.system_operator_id"
        value={systemOperator?.name}
      />
    </div>
  );
};
