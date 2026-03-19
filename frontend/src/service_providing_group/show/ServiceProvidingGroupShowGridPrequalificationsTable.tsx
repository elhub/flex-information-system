import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgGridPrequalificationRow,
  useSpgGridPrequalifications,
} from "./useSpgGridPrequalifications";
import { useNavigate } from "react-admin";

type Props = {
  spgId: number;
};

const columns: Column<SpgGridPrequalificationRow>[] = [
  { key: "id", header: "ID" },
  {
    key: "impactedSystemOperatorName",
    header: "Impacted system operator",
  },
  { key: "status", header: "Status" },
  { key: "prequalifiedAt", header: "Prequalified at" },
];

export const ServiceProvidingGroupShowGridPrequalificationsTable = ({
  spgId,
}: Props) => {
  const { data, isLoading } = useSpgGridPrequalifications(spgId);
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
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
