import { FlexPartyIdentity } from "../../auth/authProvider";
import { Alert, Button, Heading, Loader } from "../../components/ui";
import { Link } from "react-router-dom";
import { useOrgParties } from "../hooks/useOrgParties";
import { OrgPartiesTable } from "./OrgPartiesTable";
import { EntityCard } from "./EntityCard";

export const OrgDashboard = ({ identity }: { identity: FlexPartyIdentity }) => {
  const { data, isLoading, error } = useOrgParties(identity.partyID);

  if (isLoading) return <Loader size="medium" />;
  if (error) return <Alert variant="error">Failed to load parties.</Alert>;

  return (
    <div>
      {data?.entity && <EntityCard entity={data.entity} />}
      <Heading size="medium" className="mb-2">
        Party access management
      </Heading>
      <p className="mb-6">
        The organisation has the following parties. Click a party to view more
        details or manage people and accesses for them.
      </p>
      <OrgPartiesTable parties={data?.entity?.party ?? []} />
      <Heading size="medium" className="mb-2 mt-6">
        API client management
      </Heading>
      <p>API clients are managed on the entity and called entity clients.</p>
      {data?.entity && (
        <Button asChild className="mt-3">
          <Link to={`/entity/${data.entity.id}/show`}>
            Manage API clients for {data.entity.name}
          </Link>
        </Button>
      )}
      <Heading size="medium" className="mb-2 mt-6">
        Organisation representatives
      </Heading>
      <p>
        An organisation representative is managed through party memberships on
        the entity&apos;s organisation party. A representative can manage party
        access and API clients for the organisation, as well as add and remove
        other representatives.
      </p>
      {data?.id && (
        <Button asChild className="mt-3">
          <Link to={`/party/${data.id}/show`}>
            Manage organisation representatives on {data.name}
          </Link>
        </Button>
      )}
    </div>
  );
};
