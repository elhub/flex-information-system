import { IconWarningTriangle } from "@elhub/ds-icons";
import { Alert, BodyText, Loader } from "../../components/ui";
import { useNotices } from "../hooks/useNotices";
import { StatCard } from "../shared/StatCard";
import { useGetIdentity } from "ra-core";

export const FisoDashboard = () => {
  const noticeQuery = useNotices();
  const { data: identity } = useGetIdentity();

  const noticeQueryParams = identity
    ? new URLSearchParams({
        filter: JSON.stringify({ party_id: identity?.partyID }),
      })
    : undefined;

  if (noticeQuery.isLoading) return <Loader size="small" />;
  if (noticeQuery.error)
    return <Alert variant="error">Failed to load stats.</Alert>;

  return (
    <div className="flex flex-col gap-4">
      <BodyText>Welcome to the Flexibility Information System!</BodyText>
      <BodyText>
        As a Flexibility Information System Operator, it is your responsibility
        to perform some operations that the system does not do automatically,
        such as correcting discrepancies between parties stored in the database
        and the ones we regularly synchronise from external sources.
      </BodyText>
      <BodyText>
        Such operations are represented by the following notices targeted at
        your user:
      </BodyText>
      <StatCard
        label="Notices"
        value={noticeQuery.data?.count ?? 0}
        icon={
          <IconWarningTriangle
            size="medium"
            className="text-semantic-text-error"
          />
        }
        borderClass="border-l-semantic-border-error"
        iconBgClass="bg-semantic-background-error"
        actionLabel="View"
        actionTo={`/notice?${noticeQueryParams?.toString() || ""}`}
      />
    </div>
  );
};
