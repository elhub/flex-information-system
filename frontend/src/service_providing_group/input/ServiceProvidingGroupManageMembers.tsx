import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "ra-core";
import { readServiceProvidingGroup } from "../../generated-client";
import { throwOnError } from "../../util";
import { BodyText, Heading, Loader, FormContainer } from "../../components/ui";
import { ManageMembersPanel } from "../membership/ManageMembersPanel";
import { ServiceProvidingGroupStepper } from "./ServiceProvidingGroupStepper";

export const ServiceProvidingGroupManageMembers = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isWizardStep = searchParams.get("from") === "create";
  const spgId = Number(id);
  const translate = useTranslate();

  const destination = isWizardStep
    ? `/service_providing_group/${spgId}/activate?from=create`
    : `/service_providing_group/${spgId}/show?tab=controllable_units`;

  const { data: spg, isLoading } = useQuery({
    queryKey: ["service_providing_group", spgId],
    queryFn: () =>
      readServiceProvidingGroup({ path: { id: spgId } }).then(throwOnError),
    enabled: !!spgId,
  });

  if (isLoading) return <Loader />;

  const heading = spg?.name
    ? translate("text.spg_manage_members_heading", { name: spg.name })
    : translate("text.spg_manage_members_heading_no_name");

  return (
    <FormContainer>
      {isWizardStep && <ServiceProvidingGroupStepper activeStep={2} />}
      <Heading level={3} size="medium">
        {heading}
      </Heading>
      <BodyText>{translate("text.spg_manage_members_body")}</BodyText>
      <ManageMembersPanel
        spgId={spgId}
        destination={destination}
        submitLabel={
          isWizardStep
            ? translate("text.spg_manage_members_submit_next")
            : translate("text.spg_manage_members_submit_done")
        }
      />
    </FormContainer>
  );
};
