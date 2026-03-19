import { Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  SpgProductApplicationRow,
  useSpgProductApplications,
} from "./useSpgProductApplications";
import { useNavigate } from "react-admin";
import { useTranslateField } from "../../intl/intl";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowProductApplicationsTable = ({
  spgId,
}: Props) => {
  const { data, isLoading } = useSpgProductApplications(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();

  const columns: Column<SpgProductApplicationRow>[] = [
    {
      key: "id",
      header: t("service_providing_group_product_application.id"),
    },
    {
      key: "procuringSystemOperatorName",
      header: t(
        "service_providing_group_product_application.procuring_system_operator_id",
      ),
    },
    {
      key: "productTypeIds",
      header: t("service_providing_group_product_application.product_type_ids"),
      render: (value) => String(value),
    },
    {
      key: "status",
      header: t("service_providing_group_product_application.status"),
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SimpleTable
      rowClick={(row) =>
        navigate(
          `/service_providing_group/${spgId}/product_application/${row.id}/show`,
        )
      }
      size="small"
      data={data ?? []}
      columns={columns}
      className="w-full"
    />
  );
};
