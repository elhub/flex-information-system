import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgGridPrequalificationRow,
  useSpgGridPrequalifications,
} from "./useSpgGridPrequalifications";

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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SimpleTable
      size="small"
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};
