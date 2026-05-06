import { type ReactNode } from "react";

type Props = {
  statCards: ReactNode;
  activeTable: ReactNode;
  resolvedTable: ReactNode;
  extra?: ReactNode;
};

export const DashboardLayout = ({
  statCards,
  activeTable,
  resolvedTable,
  extra,
}: Props) => {
  return (
    <>
      <>
        {statCards}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
            Active Applications
          </p>
          {activeTable}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
            Recently Resolved
          </p>
          {resolvedTable}
        </div>

        {extra}
      </>
    </>
  );
};
