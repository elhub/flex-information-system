import { Loader, BodyText } from "../components/ui";
import styles from "./ServiceProvidingGroupExpandedRow.module.css";
import { useTranslate } from "ra-core";
import { RaRecord } from "ra-core";
import { Link } from "react-router-dom";
import { useSpgGridPrequalifications } from "./show/useSpgGridPrequalifications";
import { useSpgProductApplications } from "./show/useSpgProductApplications";
import { SpgpqStatusBadge } from "../components/SpgpqStatusBadge";
import { SpgpaStatusBadge } from "../components/SpgpaStatusBadge";

type BoxHeaderProps = {
  title: string;
};

const BoxHeader = ({ title }: BoxHeaderProps) => (
  <div className="mb-4">
    <span
      style={{ color: "#003d2b", letterSpacing: "0.05em" }}
      className="font-bold text-[13px] uppercase"
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
    <div className="flex items-center gap-3">
      <span
        style={{ color: "var(--eds-color-neutral-500, #6b7280)" }}
        className="text-xs font-medium min-w-7"
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
    style={{ color: "var(--eds-color-neutral-400, #9ca3af)" }}
    className="py-4 px-3 text-center"
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
    background: "var(--eds-color-neutral-100, #f3f4f6)",
    border: "1px solid var(--eds-color-neutral-200, #e5e7eb)",
  };

  return (
    <div className="flex gap-5 flex-wrap">
      {/* Grid Prequalification box */}
      <div
        style={boxStyle}
        className="flex-1 min-w-[280px] rounded-xl px-5 pt-5 pb-4"
      >
        <BoxHeader
          title={translate("text.spg_grid_prequalification_header", {
            _: "Grid Prequalifications",
          })}
        />
        {isLoadingPrequal ? (
          <Loader />
        ) : !prequalifications || prequalifications.length === 0 ? (
          <EmptyBox
            message={translate("text.spg_grid_prequalification_empty", {
              _: "No grid prequalifications",
            })}
          />
        ) : (
          prequalifications.map((prequal) => {
            return (
              <RowItem
                key={prequal.id}
                id={prequal.id}
                to={`/service_providing_group/${spgId}/grid_prequalification/${prequal.id}/show`}
                name={prequal.impactedSystemOperatorName}
                statusBadge={<SpgpqStatusBadge status={prequal.status} />}
              />
            );
          })
        )}
      </div>

      {/* Product Application box */}
      <div
        style={boxStyle}
        className="flex-1 min-w-[280px] rounded-xl px-5 pt-5 pb-4"
      >
        <BoxHeader
          title={translate("text.spg_product_application_header", {
            _: "Product Applications",
          })}
        />
        {isLoadingPa ? (
          <Loader />
        ) : !productApplications || productApplications.length === 0 ? (
          <EmptyBox
            message={translate("text.spg_product_application_empty", {
              _: "No product applications",
            })}
          />
        ) : (
          productApplications.map((pa) => {
            return (
              <RowItem
                key={pa.id}
                id={pa.id}
                to={`/service_providing_group/${spgId}/product_application/${pa.id}/show`}
                name={pa.procuringSystemOperatorName}
                statusBadge={<SpgpaStatusBadge status={pa.status} />}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
