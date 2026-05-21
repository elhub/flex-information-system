import type { FlexIdentity } from "../../auth/authProvider";
import { Alert, Heading, Loader } from "../../components/ui";
import { useOrgParties } from "../hooks/useOrgParties";
import { OrgPartiesTable } from "./OrgPartiesTable";
import { EntityCard } from "./EntityCard";

export const OrgDashboard = ({ identity }: { identity: FlexIdentity }) => {
  const { data, isLoading, error } = useOrgParties(identity.partyID!);

  if (isLoading) return <Loader size="medium" />;
  if (error) return <Alert variant="error">Failed to load parties.</Alert>;

  return (
    <div>
      {data?.data?.entity && <EntityCard entity={data.data.entity} />}
      <Heading size="medium" className="mb-2">
        Parties
      </Heading>
      <OrgPartiesTable parties={data?.data?.entity?.party ?? []} />
    </div>
  );
};
