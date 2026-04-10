import { useConfirmAction } from "../../../components/ConfirmAction";
import { Button } from "../../../components/ui";
import {
  ServiceProvidingGroupProductApplication,
  ServiceProvidingGroupProductApplicationStatus,
} from "../../../generated-client";
import { useUpdateSpgpaStatus } from "./useSpgpaShowViewModel";

type ActionConfig = {
  label: string;
  nextStatus: ServiceProvidingGroupProductApplicationStatus;
  confirmTitle: string;
  confirmContent: string;
  variant: "primary" | "secondary";
  className?: string;
};

const ACTIONS_BY_STATUS: Partial<
  Record<ServiceProvidingGroupProductApplicationStatus, ActionConfig[]>
> = {
  requested: [
    {
      label: "Start prequalification",
      nextStatus: "in_progress",
      confirmTitle: "Start prequalification",
      confirmContent:
        "This will move the application to in progress. The service provider will be notified.",
      variant: "primary",
    },
    {
      label: "Reject",
      nextStatus: "rejected",
      confirmTitle: "Reject application",
      confirmContent:
        "Are you sure you want to reject this application? The service provider will be notified.",
      variant: "secondary",
      className:
        "text-semantic-background-action-danger border-semantic-background-action-danger",
    },
  ],
  in_progress: [
    {
      label: "Mark prequalified",
      nextStatus: "prequalified",
      confirmTitle: "Mark as prequalified",
      confirmContent: "This will mark the application as prequalified.",
      variant: "primary",
    },
    {
      label: "Reject",
      nextStatus: "rejected",
      confirmTitle: "Reject application",
      confirmContent:
        "Are you sure you want to reject this application? The service provider will be notified.",
      variant: "secondary",
      className:
        "text-semantic-background-action-danger border-semantic-background-action-danger",
    },
  ],
  prequalified: [
    {
      label: "Verify",
      nextStatus: "verified",
      confirmTitle: "Verify application",
      confirmContent: "This will mark the application as verified.",
      variant: "primary",
    },
    {
      label: "Reject",
      nextStatus: "rejected",
      confirmTitle: "Reject application",
      confirmContent:
        "Are you sure you want to reject this application? The service provider will be notified.",
      variant: "secondary",
      className:
        "text-semantic-background-action-danger border-semantic-background-action-danger",
    },
  ],
};

const ActionButton = ({
  config,
  spgpaId,
  spgId,
}: {
  config: ActionConfig;
  spgpaId: number;
  spgId: number;
}) => {
  const { mutateAsync } = useUpdateSpgpaStatus(spgpaId, spgId);
  const { buttonProps, dialog } = useConfirmAction({
    title: config.confirmTitle,
    content: config.confirmContent,
    confirmText: config.label,
    onConfirmMutation: {
      mutationFn: () => mutateAsync(config.nextStatus),
    },
  });

  return (
    <>
      <Button
        variant={config.variant}
        className={config.className}
        {...buttonProps}
      >
        {config.label}
      </Button>
      {dialog}
    </>
  );
};

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
};

export const SpgpaActionBar = ({ spgpa }: Props) => {
  const actions = ACTIONS_BY_STATUS[spgpa.status];

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-between rounded-md border
      border-semantic-border-default bg-semantic-background-default
      px-4 py-3"
    >
      <span className="text-sm font-semibold text-semantic-text-default">
        System Operator actions
      </span>
      <div className="flex gap-2">
        {actions.map((config) => (
          <ActionButton
            key={config.nextStatus}
            config={config}
            spgpaId={spgpa.id}
            spgId={spgpa.service_providing_group_id}
          />
        ))}
      </div>
    </div>
  );
};
