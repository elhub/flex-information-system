import { usePermissions, useRecordContext } from "ra-core";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupMembership, ServiceProvidingGroup } from "../../generated-client";
import { Permissions } from "../../auth/permissions";
import { ActivateServiceProvidingGroupButton } from "../ActivateServiceProvidingGroupButton";
import { Alert, BodyText, Heading } from "../../components/ui";
import { throwOnError } from "../../util";
import { SpgShowViewModel, useSpgShowViewModel } from "./useSpgShowViewModel";
import { useSpgProductApplications } from "./useSpgProductApplications";

type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  content: ReactNode;
};

const useServiceProvidingGroupAlerts = (spg: ServiceProvidingGroup): AlertType | null => {
  const record = useRecordContext();
  const { data: productApplications } = useSpgProductApplications(spg.id)


  if (record?.status === "new") {
    return ({
      severity: "info",
      content: "The service providing group is not active.",
    });
  }

  if (productApplications?.length === 0) {
    return ({
      severity: "info",
      content: "You dont have a product application for this SPG."
    })
  }

  return null


};


type Props = {
  spg: ServiceProvidingGroup
}


export const ServiceProvidingGroupAlerts = (props: Props) => {
  const alert = useServiceProvidingGroupAlerts(props.spg);

  if (!alert) {
    return null;
  }

  return (
    <Alert variant={alert.severity} className="max-w-3xl gap-4">
      <BodyText>{alert.content}</BodyText>
    </Alert>
  );
};
