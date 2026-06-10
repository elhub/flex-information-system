import { useAuthenticated, useGetIdentity, useRedirect } from "ra-core";
import type { FlexIdentity } from "../auth/authProvider";
import { Heading, Loader } from "../components/ui";
import { SpDashboard } from "./service_provider/SpDashboard";
import { SoDashboard } from "./system_operator/SoDashboard";
import { OrgDashboard } from "./organisation/OrgDashboard";
import { FisoDashboard } from "./flexibility_information_system_operator/FisoDashboard";
import { DefaultDashboard } from "./DefaultDashboard";

const RoleDashboard = ({ identity }: { identity: FlexIdentity }) => {
  switch (identity.role) {
    case "flex_service_provider":
      return <SpDashboard />;
    case "flex_system_operator":
      return <SoDashboard />;
    case "flex_organisation":
      return <OrgDashboard identity={identity} />;
    case "flex_flexibility_information_system_operator":
      return <FisoDashboard />;
    default:
      return <DefaultDashboard />;
  }
};

export const Dashboard = () => {
  useAuthenticated();

  const redirect = useRedirect();
  const { data: rawIdentity, isLoading } = useGetIdentity();
  const identity = rawIdentity as FlexIdentity | undefined;

  if (!isLoading && !identity) {
    redirect("/login");
    return null;
  }

  return (
    <div
      id="flex-dashboard"
      className="flex flex-col gap-8 px-8 py-6 sm:px-4 sm:py-4 max-w-7xl mx-auto w-full"
    >
      <Heading level={2} size="large">
        Dashboard
      </Heading>
      {isLoading ? (
        <Loader size="medium" />
      ) : (
        <RoleDashboard identity={identity!} />
      )}
    </div>
  );
};
