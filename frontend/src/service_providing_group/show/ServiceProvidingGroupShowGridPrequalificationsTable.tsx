import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgGridPrequalificationRow,
  useSpgGridPrequalifications,
} from "./useSpgGridPrequalifications";
import { useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowGridPrequalificationsTable = ({
  spgId,
}: Props) => {
  const { data, isLoading, error } = useSpgGridPrequalifications(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();

  const columns: Column<SpgGridPrequalificationRow>[] = [
    {
      key: "id",
      header: t("service_providing_group_grid_prequalification.id"),
    },
    {
      key: "impactedSystemOperatorName",
      header: t(
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      ),
    },
    {
      key: "status",
      header: t("service_providing_group_grid_prequalification.status"),
    },
    {
      key: "prequalifiedAt",
      header: t(
        "service_providing_group_grid_prequalification.prequalified_at",
      ),
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  return (
    <SimpleTable
      size="small"
      rowClick={(row) =>
        navigate(
          `/service_providing_group/${spgId}/grid_prequalification/${row.id}/show`,
        )
      }
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};
