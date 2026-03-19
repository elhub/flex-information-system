import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgProductApplicationRow,
  useSpgProductApplications,
} from "./useSpgProductApplications";

type Props = {
  spgId: number;
};

const columns: Column<SpgProductApplicationRow>[] = [
  { key: "id", header: "ID" },
  {
    key: "procuringSystemOperatorName",
    header: "Procuring system operator",
  },
  {
    key: "productTypeIds",
    header: "Product type IDs",
    render: (value) => String(value),
  },
  { key: "status", header: "Status" },
];

export const ServiceProvidingGroupShowProductApplicationsTable = ({
  spgId,
}: Props) => {
  const { data, isLoading } = useSpgProductApplications(spgId);

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
