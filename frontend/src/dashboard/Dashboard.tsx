// frontend/src/dashboard/Dashboard.tsx
import { type ReactNode } from "react";
import { useAuthenticated, useGetIdentity } from "ra-core";
import { Alert, Card, CardContent, Heading, Loader } from "../components/ui";
import {
  IconClockCircle,
  IconQualitiesCircle,
  IconWarningTriangle,
} from "@elhub/ds-icons";
import { ApplicationsTable } from "./ApplicationsTable";
import { useDashboardApplications } from "./useDashboardApplications";
import { SpApplicationsTable } from "./SpApplicationsTable";
import { useSpDashboard } from "./useSpDashboard";

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  borderClass: string;
  iconBgClass: string;
};

const StatCard = ({
  label,
  value,
  icon,
  borderClass,
  iconBgClass,
}: StatCardProps) => (
  <Card className={`flex-1 border-l-4 ${borderClass}`}>
    <CardContent className="flex items-center gap-4 py-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-semantic-text leading-none">
          {value}
        </p>
      </div>
    </CardContent>
  </Card>
);

const SoDashboard = () => {
  const { activeItems, resolvedItems, isLoading, error } = useDashboardApplications();

  return (
    <>
      {isLoading && <Loader size="medium" />}
      {error && <Alert variant="error">Failed to load applications.</Alert>}

      {!isLoading && !error && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <StatCard
              label="Pending Applications"
              value={activeItems.length}
              icon={
                <IconClockCircle
                  size="medium"
                  className="text-semantic-text-information"
                />
              }
              borderClass="border-l-semantic-border-information"
              iconBgClass="bg-semantic-background-information"
            />
            <StatCard
              label="Resource Inconsistencies"
              value={3}
              icon={
                <IconWarningTriangle
                  size="medium"
                  className="text-semantic-text-error"
                />
              }
              borderClass="border-l-semantic-border-error"
              iconBgClass="bg-semantic-background-error"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
              Active Applications
            </p>
            <ApplicationsTable items={activeItems} empty="No active applications." />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
              Recently Resolved
            </p>
            <ApplicationsTable items={resolvedItems} empty="No resolved applications." />
          </div>
        </>
      )}
    </>
  );
};

const SpDashboard = () => {
  const {
    activeItems,
    resolvedItems,
    pendingCount,
    activeSpgCount,
    inconsistencyCount,
    isLoading,
    error,
  } = useSpDashboard();

  return (
    <>
      {isLoading && <Loader size="medium" />}
      {error && <Alert variant="error">Failed to load applications.</Alert>}

      {!isLoading && !error && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <StatCard
              label="Pending Applications"
              value={pendingCount}
              icon={
                <IconClockCircle
                  size="medium"
                  className="text-semantic-text-information"
                />
              }
              borderClass="border-l-semantic-border-information"
              iconBgClass="bg-semantic-background-information"
            />
            <StatCard
              label="Active SPGs"
              value={activeSpgCount}
              icon={
                <IconQualitiesCircle
                  size="medium"
                  className="text-semantic-text-success"
                />
              }
              borderClass="border-l-semantic-border-success"
              iconBgClass="bg-semantic-background-success"
            />
            <StatCard
              label="Inconsistencies"
              value={inconsistencyCount}
              icon={
                <IconWarningTriangle
                  size="medium"
                  className="text-semantic-text-error"
                />
              }
              borderClass="border-l-semantic-border-error"
              iconBgClass="bg-semantic-background-error"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
              Active Applications
            </p>
            <SpApplicationsTable
              items={activeItems}
              empty="No active applications."
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
              Recently Resolved
            </p>
            <SpApplicationsTable
              items={resolvedItems}
              empty="No resolved applications."
            />
          </div>
        </>
      )}
    </>
  );
};

export const Dashboard = () => {
  useAuthenticated();

  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role === "flex_system_operator";
  const isServiceProvider = identity?.role === "flex_service_provider";

  return (
    <div
      id="flex-dashboard"
      className="flex flex-col gap-10 px-8 py-6 sm:px-4 sm:py-4 max-w-7xl mx-auto w-full"
    >
      <Heading level={2} size="medium">
        Dashboard
      </Heading>

      {isSystemOperator && <SoDashboard />}
      {isServiceProvider && <SpDashboard />}
    </div>
  );
};
