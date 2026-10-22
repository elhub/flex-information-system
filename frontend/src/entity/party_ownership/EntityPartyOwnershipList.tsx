import { usePermissions, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listParty, PartyStatus } from "../../generated-client";
import { StatusBadge } from "../../components/StatusBadge";
import { partyStatusVariantMap } from "../../party/partyStatus";
import { throwOnError } from "../../util";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { Loader } from "../../components/ui";
import { Permissions } from "../../auth/permissions";
import { useTranslateField } from "../../intl/intl";

export const EntityPartyOwnershipList = ({
  entityId,
}: {
  entityId: number;
}) => {
  const { permissions } = usePermissions<Permissions>();
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();
  const canRead = permissions?.allow("party", "read");
  const { data, isLoading } = useQuery({
    queryKey: ["party", { entity_id: entityId }],
    queryFn: () =>
      listParty({
        query: { entity_id: `eq.${entityId}`, order: "id.desc" },
      }).then(throwOnError),
    enabled: !!entityId,
  });

  if (!canRead) return null;
  if (isLoading) return <Loader />;

  const columns: ColumnOf<typeof data>[] = [
    { key: "id", header: t("party.id") },
    { key: "name", header: t("party.name") },
    { key: "business_id", header: t("party.business_id") },
    { key: "type", header: t("party.type") },
    { key: "role", header: t("party.role") },
    {
      key: "status",
      header: t("party.status"),
      render: (value) => {
        const status = value as PartyStatus;
        const variant = partyStatusVariantMap[status];
        if (!variant) return value as string;
        return (
          <StatusBadge
            status={variant.status}
            icon={variant.icon}
            label={translate(`enum.party.status.${status}`)}
          />
        );
      },
    },
  ];

  return (
    <SimpleTable
      data={data ?? []}
      columns={columns}
      rowClick={(row) => navigate(`/party/${row.id}/show`)}
      className="w-full"
    />
  );
};
