import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardContent, Loader } from "../../components/ui";
import {
  ProductType,
  ServiceProviderProductApplication,
} from "../../generated-client";
import { useProductTypes } from "../../product_type/components";
import { IconPlus } from "@elhub/ds-icons";
import { useQualifiedServiceProviderProductApplications } from "../hooks/useSpQualifiedMarkets";

const groupBySO = (
  applications: ServiceProviderProductApplication[] | undefined,
  productTypes: ProductType[] | undefined,
) => {
  if (!applications || !productTypes) return [];

  const qualifiedMarketsMap = applications.reduce((map, app) => {
    if (map.has(app.system_operator_id)) {
      map
        .get(app.system_operator_id)
        ?.productTypeIds.push(...app.product_type_ids);
      return map;
    }

    const soName = app.system_operator?.name || "Unknown SO";
    map.set(app.system_operator_id, {
      soName,
      productTypeIds: [...app.product_type_ids],
    });
    return map;
  }, new Map<number, { soName: string; productTypeIds: number[] }>());

  return Array.from(qualifiedMarketsMap.entries()).map(
    ([soId, { soName, productTypeIds }]) => ({
      soId,
      soName,
      productTypeNames: productTypeIds
        .map(
          (ptId) =>
            productTypes.find((pt) => pt.id === ptId)?.name ||
            "Unknown Product Type",
        )
        .join(", "),
    }),
  );
};

type SpMarketsCardProps = {
  spId: number | undefined;
};

export const SpMarketsCard = ({ spId }: SpMarketsCardProps) => {
  const navigate = useNavigate();
  const {
    data: qualifiedSPApplications,
    isLoading,
    isError,
  } = useQualifiedServiceProviderProductApplications(spId);
  const { data: allProductTypes } = useProductTypes();
  const rows = groupBySO(qualifiedSPApplications, allProductTypes);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
        My Markets
      </p>
      <Card>
        <CardContent className="py-4">
          {isLoading ? (
            <Loader size="small" />
          ) : isError ? (
            <Alert variant="error">Failed to load qualified markets.</Alert>
          ) : (
            <>
              {rows.length === 0 ? (
                <p className="text-sm text-semantic-text-subtle">
                  No qualified markets yet.
                </p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-semantic-border">
                      <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle">
                        System Operator
                      </th>
                      <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle">
                        Product Types
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.soId}>
                        <td className="py-2 pr-4 text-sm">{row.soName}</td>
                        <td className="py-2 text-sm">{row.productTypeNames}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="mt-4">
                <Button
                  variant="tertiary"
                  icon={IconPlus}
                  iconPosition="left"
                  onClick={() =>
                    navigate("/service_provider_product_application/create")
                  }
                >
                  Apply for new market
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
