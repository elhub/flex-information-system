import { formatDate } from "date-fns";
import { usePermissions, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listPartyMembership } from "../../generated-client";
import { throwOnError } from "../../util";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { Chips } from "../../components/ui";
import { Permissions } from "../../auth/permissions";
import { useTranslateField } from "../../intl/intl";

const useEntityPartyMemberships = (
  entityId: number | undefined,
  canRead: boolean,
) =>
  useQuery({
    queryKey: ["party_membership", { entity_id: entityId }],
    queryFn: () =>
      listPartyMembership({
        query: {
          entity_id: `eq.${entityId}`,
          embed: "party",
          order: "id.desc",
        },
      }).then(throwOnError),
    enabled: !!entityId && canRead,
  });

export const EntityPartyMembershipList = ({
  entityId,
}: {
  entityId: number;
}) => {
  const { permissions } = usePermissions<Permissions>();
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();
  const canRead = permissions?.allow("party_membership", "read");
  const { data, isLoading, error } = useEntityPartyMemberships(
    entityId,
    !!canRead,
  );

  if (!canRead) return null;

  const columns: ColumnOf<typeof data>[] = [
    { key: "id", header: t("party_membership.id") },
    {
      key: "party",
      header: t("party_membership.party_id"),
      render: (_, row) => row.party?.name ?? row.party_id,
    },
    {
      key: "party_id",
      header: t("party.business_id"),
      render: (_, row) => row.party?.business_id ?? "",
    },
    {
      key: "scopes",
      header: t("party_membership.scopes"),
      render: (value) => (
        <Chips>
          {(value as string[]).map((scope) => (
            <Chips.Chip key={scope}>{scope}</Chips.Chip>
          ))}
        </Chips>
      ),
    },
    {
      key: "recorded_at",
      header: t("party_membership.recorded_at"),
      render: (value) => formatDate(String(value), "dd.MM.yyyy HH:mm"),
    },
  ];

  return (
    <SimpleTable
      data={data ?? []}
      columns={columns}
      rowClick={(row) => navigate(`/party/${row.party_id}/show`)}
      className="w-full"
      loading={isLoading}
      empty={error ? translate("text.simple_table.load_error") : undefined}
    />
  );
};
