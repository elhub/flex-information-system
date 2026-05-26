import { Loader, Badge, BodyText } from "../components/ui";
import styles from "./ServiceProvidingGroupExpandedRow.module.css";
import { useTranslate } from "ra-core";
import { RaRecord } from "ra-core";
import { Link } from "react-router-dom";
import { useSpgGridPrequalifications } from "./show/useSpgGridPrequalifications";
import { useSpgProductApplications } from "./show/useSpgProductApplications";
import { spgpqStatusVariantMap } from "./grid_prequalification/show/spgpqStatus";
import { spgpaStatusVariantMap } from "./product_application/show/spgpaStatus";
import { ServiceProvidingGroupGridPrequalificationStatus } from "../generated-client";
import { ServiceProvidingGroupProductApplicationStatus } from "../generated-client";

type BoxHeaderProps = {
  title: string;
};

const BoxHeader = ({ title }: BoxHeaderProps) => (
  <div
    style={{
      marginBottom: "16px",
    }}
  >
    <span
      style={{
        fontWeight: 700,
        fontSize: "13px",
        color: "#003d2b",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {title}
    </span>
  </div>
);

type RowItemProps = {
  name: string;
  statusBadge: React.ReactNode;
  id: number;
  to: string;
};

const RowItem = ({ name, statusBadge, id, to }: RowItemProps) => (
  <Link to={to} className={styles.rowItem}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span
        style={{
          fontSize: "12px",
          color: "var(--eds-color-neutral-500, #6b7280)",
          fontWeight: 500,
          minWidth: "28px",
        }}
      >
        #{id}
      </span>
      <BodyText size="small">{name}</BodyText>
    </div>
    {statusBadge}
  </Link>
);

const EmptyBox = ({ message }: { message: string }) => (
  <div
    style={{
      padding: "16px 12px",
      textAlign: "center",
      color: "var(--eds-color-neutral-400, #9ca3af)",
    }}
  >
    <BodyText size="small">{message}</BodyText>
  </div>
);

type Props = {
  record: RaRecord & { id: number };
};

export const ServiceProvidingGroupExpandedRow = ({ record }: Props) => {
  const translate = useTranslate();
  const spgId = record.id;

  const { data: prequalifications, isLoading: isLoadingPrequal } =
    useSpgGridPrequalifications(spgId);

  const { data: productApplications, isLoading: isLoadingPa } =
    useSpgProductApplications(spgId);

  const boxStyle: React.CSSProperties = {
    flex: "1 1 0",
    minWidth: "280px",
    background: "var(--eds-color-neutral-100, #f3f4f6)",
    borderRadius: "12px",
    padding: "20px 20px 16px 20px",
    border: "1px solid var(--eds-color-neutral-200, #e5e7eb)",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      {/* Grid Prequalification box */}
      <div style={boxStyle}>
        <BoxHeader
          title={translate("text.spg_grid_prequalification_header", {
            _: "Grid Prequalifications",
          })}
        />
        {isLoadingPrequal ? (
          <Loader />
        ) : !prequalifications || prequalifications.length === 0 ? (
          <EmptyBox message="No grid prequalifications" />
        ) : (
          prequalifications.map((prequal) => {
            const variant =
              spgpqStatusVariantMap[
                prequal.status as ServiceProvidingGroupGridPrequalificationStatus
              ];
            return (
              <RowItem
                key={prequal.id}
                id={prequal.id}
                to={`/service_providing_group/${spgId}/grid_prequalification/${prequal.id}/show`}
                name={prequal.impactedSystemOperatorName}
                statusBadge={
                  variant ? (
                    <Badge
                      size="small"
                      status={variant.status}
                      variant="block"
                      icon={variant.icon}
                    >
                      {translate(
                        `enum.service_providing_group_grid_prequalification.status.${prequal.status}`,
                      )}
                    </Badge>
                  ) : null
                }
              />
            );
          })
        )}
      </div>

      {/* Product Application box */}
      <div style={boxStyle}>
        <BoxHeader
          title={translate("text.spg_product_application_header", {
            _: "Product Applications",
          })}
        />
        {isLoadingPa ? (
          <Loader />
        ) : !productApplications || productApplications.length === 0 ? (
          <EmptyBox message="No product applications" />
        ) : (
          productApplications.map((pa) => {
            const variant =
              spgpaStatusVariantMap[
                pa.status as ServiceProvidingGroupProductApplicationStatus
              ];
            return (
              <RowItem
                key={pa.id}
                id={pa.id}
                to={`/service_providing_group/${spgId}/product_application/${pa.id}/show`}
                name={pa.procuringSystemOperatorName}
                statusBadge={
                  variant ? (
                    <Badge
                      size="small"
                      status={variant.status}
                      variant="block"
                      icon={variant.icon}
                    >
                      {translate(
                        `enum.service_providing_group_product_application.status.${pa.status}`,
                      )}
                    </Badge>
                  ) : null
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
};
