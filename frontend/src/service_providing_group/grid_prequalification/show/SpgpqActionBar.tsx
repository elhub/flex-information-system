import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { Button } from "../../../components/ui";
import {
  ServiceProvidingGroupGridPrequalification,
  ServiceProvidingGroupGridPrequalificationUpdateRequest,
  updateServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { throwOnError } from "../../../util";
import { spgpqQueryKey } from "./useSpgpqShowViewModel";

type ActionConfig = {
  label: string;
  payload: ServiceProvidingGroupGridPrequalificationUpdateRequest;
  confirmTitle: string;
  confirmContent: string;
  variant: "primary" | "secondary";
};

const notApprovedAction: ActionConfig = {
  label: "Mark not approved",
  payload: { status: "not_approved" },
  confirmTitle: "Mark as not approved",
  confirmContent:
    "Are you sure you want to mark this as not approved? The service provider will be notified.",
  variant: "secondary",
};

const getActionsForStatus = (
  spgpq: ServiceProvidingGroupGridPrequalification,
): ActionConfig[] => {
  switch (spgpq.status) {
    case "requested":
      return [
        {
          label: "Start review",
          payload: { status: "in_progress" },
          confirmTitle: "Start review",
          confirmContent:
            "This will move the grid prequalification to in progress.",
          variant: "primary",
        },
        notApprovedAction,
      ];
    case "in_progress":
      return [
        {
          label: "Approve",
          payload: {
            status: "approved",
            prequalified_at: new Date().toISOString(),
          },
          confirmTitle: "Approve grid prequalification",
          confirmContent:
            "This will mark the grid prequalification as approved.",
          variant: "primary",
        },
        {
          label: "Conditionally approve",
          payload: {
            status: "conditionally_approved",
            prequalified_at: new Date().toISOString(),
          },
          confirmTitle: "Conditionally approve grid prequalification",
          confirmContent:
            "This will mark the grid prequalification as conditionally approved.",
          variant: "primary",
        },
        notApprovedAction,
      ];
    default:
      return [];
  }
};

const ActionButton = ({
  config,
  spgpqId,
  spgId,
}: {
  config: ActionConfig;
  spgpqId: number;
  spgId: number;
}) => {
  const queryClient = useQueryClient();
  const { buttonProps, dialog } = useConfirmAction({
    title: config.confirmTitle,
    content: config.confirmContent,
    confirmText: config.label,
    onConfirmMutation: {
      mutationFn: () =>
        updateServiceProvidingGroupGridPrequalification({
          path: { id: spgpqId },
          body: config.payload,
        }).then(throwOnError),
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: spgpqQueryKey(spgpqId),
        });
        void queryClient.invalidateQueries({
          queryKey: ["service_providing_group", spgId],
        });
      },
    },
  });

  return (
    <>
      <Button variant={config.variant} {...buttonProps}>
        {config.label}
      </Button>
      {dialog}
    </>
  );
};

type Props = {
  spgpq: ServiceProvidingGroupGridPrequalification;
};

export const SpgpqActionBar = ({ spgpq }: Props) => {
  const actions = getActionsForStatus(spgpq);

  if (actions.length === 0) return null;

  return (
    <div
      className="flex items-center justify-end rounded-md border
      border-semantic-border-default bg-global-color-white
      px-4 py-3"
    >
      <div className="flex gap-2">
        {actions.map((config) => (
          <ActionButton
            key={config.label}
            config={config}
            spgpqId={spgpq.id}
            spgId={spgpq.service_providing_group_id}
          />
        ))}
      </div>
    </div>
  );
};
