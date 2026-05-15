import { useAuthenticated, useGetIdentity } from "ra-core";
import { Heading, Loader } from "../components/ui";
import { SpDashboard } from "./service_provider/SpDashboard";
import { SoDashboard } from "./system_operator/SoDashboard";
import { DefaultDashboard } from "./DefaultDashboard";

export const Dashboard = () => {
  useAuthenticated();

  const { data: identity, isLoading } = useGetIdentity();

  return (
    <div
      id="flex-dashboard"
      className="flex flex-col gap-8 px-8 py-6 sm:px-4 sm:py-4 max-w-7xl mx-auto w-full"
    >
      <Heading level={2} size="large">
        Dashboard
      </Heading>
      {isLoading && <Loader size="medium" />}
      {!isLoading && identity?.role === "flex_service_provider" && (
        <SpDashboard />
      )}
      {!isLoading && identity?.role === "flex_system_operator" && (
        <SoDashboard />
      )}
      {!isLoading &&
        identity?.role !== "flex_service_provider" &&
        identity?.role !== "flex_system_operator" && <DefaultDashboard />}
    </div>
  );
};
