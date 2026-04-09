import { usePermissions, useRecordContext } from "ra-core";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupMembership } from "../generated-client";
import { Permissions } from "../auth/permissions";
import { ActivateServiceProvidingGroupButton } from "./ActivateServiceProvidingGroupButton";
import { Alert, BodyText, Heading } from "../components/ui";
import { throwOnError } from "../util";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  title: string;
  content: ReactNode;
  action?: ReactNode;
};

const useServiceProvidingGroupAlerts = (): AlertType | null => {
  const record = useRecordContext();
  const { permissions } = usePermissions<Permissions>();

  const canUpdate = permissions?.allow("service_providing_group", "update");

  const spgId = record?.id ? Number(record.id) : undefined;

  const { data: members, isLoading } = useQuery({
    queryKey: ["service_providing_group_membership", spgId],
    queryFn: () =>
      listServiceProvidingGroupMembership({
        query: { service_providing_group_id: "eq." + spgId },
      }).then(throwOnError),
    enabled: record?.status === "new" && spgId !== undefined,
  });

  if (record?.status !== "new" || isLoading) {
    return null;
  }

  if (members?.length === 0) {
    return {
      severity: "info",
      title: "No members",
      content:
        "To activate the service providing group, at least one controllable unit must be a member.",
    };
  }

  return {
    severity: "info",
    title: "Not active",
    content: "The service providing group is not active.",
    action: (
      <ActivateServiceProvidingGroupButton
        spgId={spgId!}
        disabled={!canUpdate}
      />
    ),
  };
};

export const ServiceProvidingGroupAlerts = () => {
  const alert = useServiceProvidingGroupAlerts();

  if (!alert) {
    return null;
  }

  return (
    <Alert variant={alert.severity} className="max-w-3xl gap-4">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex-5 flex flex-col gap-2">
          <Heading level={5} size="small">
            {alert.title}
          </Heading>
          <BodyText>{alert.content}</BodyText>
        </div>
        {alert.action && <div className="flex-1">{alert.action}</div>}
      </div>
    </Alert>
  );
};
