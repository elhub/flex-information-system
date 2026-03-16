import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { readServiceProvidingGroup } from "../../generated-client";
import { throwOnError } from "../../util";
import { Button, Heading, Loader, FormContainer } from "../../components/ui";
import { ServiceProvidingGroupMembershipTable } from "../membership/ServiceProvidingGroupMembershipTable";
import { ServiceProvidingGroupStepper } from "./ServiceProvidingGroupStepper";

export const ServiceProvidingGroupManageMembers = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showStepper = searchParams.get("from") === "create";
  const spgId = Number(id);

  const { data: spg, isLoading } = useQuery({
    queryKey: ["service_providing_group", spgId],
    queryFn: () =>
      readServiceProvidingGroup({ path: { id: spgId } }).then(throwOnError),
    enabled: !!spgId,
  });

  if (isLoading) return <Loader />;

  return (
    <FormContainer>
      {showStepper && <ServiceProvidingGroupStepper activeStep={2} />}
      <Heading level={3} size="medium">
        Manage members{spg?.name ? ` of ${spg.name}` : ""}
      </Heading>
      <ServiceProvidingGroupMembershipTable spgId={spgId} />
      <div className="mt-4">
        <Button
          variant="primary"
          onClick={() =>
            navigate(
              showStepper
                ? `/service_providing_group/${spgId}/activate?from=create`
                : `/service_providing_group/${spgId}/show`,
            )
          }
        >
          {showStepper ? "Next" : "Done"}
        </Button>
      </div>
    </FormContainer>
  );
};
