import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../../components/ConfirmAction";
import { Button } from "../../components/ui";
import {
  ServiceProviderProductApplication,
  ServiceProviderProductApplicationUpdateRequest,
  updateServiceProviderProductApplication,
} from "../../generated-client";
import { throwOnError } from "../../util";
import { sppaQueryKey } from "./useSppaShowViewModel";

type ActionConfig = {
  label: string;
  payload: ServiceProviderProductApplicationUpdateRequest;
  confirmTitle: string;
  confirmContent: string;
  variant: "primary" | "secondary";
};

const getActionsForStatus = (
  sppa: ServiceProviderProductApplication,
): ActionConfig[] => {
  if (sppa.status === "qualified" || sppa.status === "not_qualified") {
    return [];
  }

  return [
    {
      label: "Mark qualified",
      payload: {
        status: "qualified",
        qualified_at: new Date().toISOString(),
      },
      confirmTitle: "Mark as qualified",
      confirmContent:
        "This will mark the application as qualified. The service provider will be notified.",
      variant: "primary",
    },
    {
      label: "Reject",
      payload: { status: "not_qualified" },
      confirmTitle: "Reject application",
      confirmContent:
        "Are you sure you want to reject this application? The service provider will be notified.",
      variant: "secondary",
    },
  ];
};

const ActionButton = ({
  config,
  sppaId,
}: {
  config: ActionConfig;
  sppaId: number;
}) => {
  const queryClient = useQueryClient();
  const { buttonProps, dialog } = useConfirmAction({
    title: config.confirmTitle,
    content: config.confirmContent,
    confirmText: config.label,
    onConfirmMutation: {
      mutationFn: () =>
        updateServiceProviderProductApplication({
          path: { id: sppaId },
          body: config.payload,
        }).then(throwOnError),
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: sppaQueryKey(sppaId),
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
  sppa: ServiceProviderProductApplication;
};

export const SppaActionBar = ({ sppa }: Props) => {
  const actions = getActionsForStatus(sppa);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-end rounded-md border
      border-semantic-border-default bg-global-color-white
      px-4 py-3"
    >
      <div className="flex gap-2">
        {actions.map((config) => (
          <ActionButton key={config.label} config={config} sppaId={sppa.id} />
        ))}
      </div>
    </div>
  );
};
