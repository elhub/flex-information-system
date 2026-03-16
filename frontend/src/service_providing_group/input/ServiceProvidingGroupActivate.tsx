import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotify } from "ra-core";
import {
  readServiceProvidingGroup,
  readParty,
  updateServiceProvidingGroup,
} from "../../generated-client";
import { throwOnError } from "../../util";
import {
  Alert,
  Button,
  FormContainer,
  Heading,
  Loader,
} from "../../components/ui";
import { ServiceProvidingGroupStepper } from "./ServiceProvidingGroupStepper";
import { useControllableUnitsInSpg } from "../membership/useSpgMemberships";
import { LabelValue } from "../../components/LabelValue";
import { SimpleTable } from "../../components/SimpleTable";
import { useTranslateField } from "../../intl/intl";

export const ServiceProvidingGroupActivate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const showStepper = searchParams.get("from") === "create";
  const spgId = Number(id);
  const t = useTranslateField();

  const { data: spg, isLoading: spgLoading } = useQuery({
    queryKey: ["service_providing_group", spgId],
    queryFn: () =>
      readServiceProvidingGroup({ path: { id: spgId } }).then(throwOnError),
    enabled: !!spgId,
  });

  const { data: serviceProvider, isLoading: partyLoading } = useQuery({
    queryKey: ["party", spg?.service_provider_id],
    queryFn: () =>
      readParty({ path: { id: spg!.service_provider_id } }).then(throwOnError),
    enabled: !!spg?.service_provider_id,
  });

  const { data: members, isLoading: membersLoading } =
    useControllableUnitsInSpg(spgId);

  const { mutateAsync: activate, isPending } = useMutation({
    mutationFn: () =>
      updateServiceProvidingGroup({
        path: { id: spgId },
        body: { status: "active" },
      }).then(throwOnError),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service_providing_group", spgId],
      });
      navigate(`/service_providing_group/${spgId}/show`);
    },
    onError: (err: Error) => {
      notify(err.message, { type: "error" });
    },
  });

  const handleActivateLater = () => {
    navigate(`/service_providing_group/${spgId}/show`);
  };

  if (spgLoading || partyLoading) return <Loader />;

  const memberColumns = [
    { key: "id" as const, header: t("controllable_unit.id") },
    { key: "name" as const, header: t("controllable_unit.name") },
    {
      key: "accounting_point_business_id" as const,
      header: t("controllable_unit.accounting_point_id"),
    },
    {
      key: "bidding_zone" as const,
      header: t("accounting_point_bidding_zone.bidding_zone"),
      render: (v: unknown) => (v as string | undefined) ?? "—",
    },
    {
      key: "technical_resource_count" as const,
      header: "Nr. of Technical Resources",
    },
    {
      key: "maximum_active_power" as const,
      header: t("controllable_unit.maximum_active_power"),
    },
    { key: "status" as const, header: t("controllable_unit.status") },
  ];

  return (
    <FormContainer>
      {showStepper && <ServiceProvidingGroupStepper activeStep={3} />}
      <Heading level={3} size="medium">
        Activate {spg?.name ?? "Service Providing Group"}
      </Heading>

      <div className="flex flex-col gap-5">
        <Alert variant="info">
          Activating the service providing group makes it eligible to
          participate in flexibility markets. You can activate later from the
          group&apos;s detail page.
        </Alert>
        <div>
          <Heading level={4} size="xsmall">
            Group details
          </Heading>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 mt-2">
            <LabelValue
              labelKey="service_providing_group.name"
              value={spg?.name}
            />
            <LabelValue
              labelKey="service_providing_group.service_provider_id"
              value={serviceProvider?.name ?? String(spg?.service_provider_id)}
            />
            <LabelValue
              labelKey="service_providing_group.bidding_zone"
              value={spg?.bidding_zone}
            />
            <LabelValue
              labelKey="service_providing_group.status"
              value={spg?.status}
            />
          </div>
        </div>

        <div>
          <Heading level={4} size="xsmall">
            Controllable units
          </Heading>
          {membersLoading ? (
            <Loader />
          ) : (
            <SimpleTable
              size="small"
              data={members ?? []}
              empty="No controllable units in this group."
              columns={memberColumns}
            />
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            variant="primary"
            onClick={() => activate()}
            disabled={isPending}
          >
            Activate
          </Button>
          <Button
            variant="secondary"
            onClick={handleActivateLater}
            disabled={isPending}
          >
            Activate later
          </Button>
        </div>
      </div>
    </FormContainer>
  );
};
