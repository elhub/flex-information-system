import type { ResourceSummaryField } from "../../components/ResourceShowLayout";
import { ServiceProviderProductApplication } from "../../generated-client";
import { useGetAllProductTypes } from "../../product_type/components";

type Props = {
  sppa: ServiceProviderProductApplication | undefined;
  serviceProviderName?: string;
  systemOperatorName?: string;
};

export const useSppaShowSummary = ({
  sppa,
  serviceProviderName,
  systemOperatorName,
}: Props): ResourceSummaryField[] => {
  const productTypes = useGetAllProductTypes();

  if (!sppa) return [];

  const productTypeNames = productTypes
    ?.filter((pt) => sppa.product_type_ids.includes(pt.id))
    .map((pt) => pt.name)
    .join(", ");

  return [
    {
      labelKey: "service_provider_product_application.service_provider_id",
      value: serviceProviderName,
    },
    {
      labelKey: "service_provider_product_application.system_operator_id",
      value: systemOperatorName,
    },
    {
      labelKey: "service_provider_product_application.product_type_ids",
      value: productTypeNames,
    },
    {
      labelKey: "service_provider_product_application.qualified_at",
      value: sppa.qualified_at,
    },
  ];
};
