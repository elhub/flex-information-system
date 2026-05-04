import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, CardContent, Loader } from "../components/ui";
import { listParty } from "../generated-client";
import { useProductTypes } from "../product_type/components";
import { throwOnError } from "../util";
import { useSpQualifiedMarkets } from "./useSpQualifiedMarkets";

type SoRowCellProps = {
  soId: number;
  productTypeIds: number[];
  soMap: Map<number, string>;
  ptMap: Map<number, string>;
};

const SoRowCell = ({ soId, productTypeIds, soMap, ptMap }: SoRowCellProps) => {
  const soName = soMap.get(soId) ?? String(soId);
  const ptNames = productTypeIds
    .map((id) => ptMap.get(id) ?? String(id))
    .join(", ");
  return (
    <tr>
      <td className="py-2 pr-4 text-sm">{soName}</td>
      <td className="py-2 text-sm">{ptNames}</td>
    </tr>
  );
};

type SpMarketsCardProps = {
  spId: number | undefined;
};

export const SpMarketsCard = ({ spId }: SpMarketsCardProps) => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSpQualifiedMarkets(spId);

  // Derive rows from API data, grouped by SO (one row per SO, merged product types)
  const rows = useMemo(() => {
    const grouped = new Map<number, Set<number>>();
    for (const item of data ?? []) {
      const soId = item.system_operator_id ?? 0;
      const ptIds = (item.product_type_ids as number[] | null) ?? [];
      if (!grouped.has(soId)) grouped.set(soId, new Set());
      for (const ptId of ptIds) grouped.get(soId)!.add(ptId);
    }
    return [...grouped.entries()].map(([soId, ptSet]) => ({
      system_operator_id: soId,
      product_type_ids: [...ptSet],
    }));
  }, [data]);

  // Collect unique IDs for batch fetches
  const uniqueSoIds = useMemo(
    () => [...new Set(rows.map((r) => r.system_operator_id))],
    [rows],
  );
  const uniquePtIds = useMemo(
    () => [...new Set(rows.flatMap((r) => r.product_type_ids))],
    [rows],
  );

  // Batch-fetch SO names (same pattern as useSpDashboard)
  const soQuery = useQuery({
    queryKey: ["sp-markets-parties", uniqueSoIds],
    enabled: uniqueSoIds.length > 0,
    queryFn: () =>
      listParty({
        query: { id: `in.(${uniqueSoIds.join(",")})` },
      }).then(throwOnError),
  });

  // Use global product type cache
  const { data: allProductTypes, isLoading: ptLoading } = useProductTypes();

  const soMap = useMemo(
    () =>
      new Map((soQuery.data ?? []).map((p) => [p.id, p.name ?? String(p.id)])),
    [soQuery.data],
  );

  const ptMap = useMemo(
    () =>
      new Map(
        (allProductTypes ?? [])
          .filter((pt) => uniquePtIds.includes(pt.id))
          .map((pt) => [pt.id, pt.name ?? String(pt.id)]),
      ),
    [allProductTypes, uniquePtIds],
  );

  // Wait for both lookup queries to load (only if data arrived and IDs exist)
  const isLookupLoading =
    (uniqueSoIds.length > 0 && soQuery.isLoading) ||
    (uniquePtIds.length > 0 && ptLoading);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
        My Markets
      </p>
      <Card>
        <CardContent className="py-4">
          {isLoading || isLookupLoading ? (
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
                      <SoRowCell
                        key={row.system_operator_id}
                        soId={row.system_operator_id}
                        productTypeIds={row.product_type_ids}
                        soMap={soMap}
                        ptMap={ptMap}
                      />
                    ))}
                  </tbody>
                </table>
              )}
              <div className="mt-4">
                <Button
                  variant="tertiary"
                  onClick={() =>
                    navigate("/service_provider_product_application/create")
                  }
                >
                  + Apply for new market
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
