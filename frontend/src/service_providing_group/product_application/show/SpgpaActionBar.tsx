import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { Button } from "../../../components/ui";
import {
  ServiceProvidingGroupProductApplication,
  ServiceProvidingGroupProductApplicationUpdateRequest,
  updateServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { throwOnError } from "../../../util";
import { spgpaQueryKey } from "./useSpgpaShowViewModel";

// The generated type does not model nullable timestamp fields, but the DB
// accepts null to clear them (required by the status transition trigger).
type SpgpaPayload = Omit<
  ServiceProvidingGroupProductApplicationUpdateRequest,
  "prequalified_at" | "verified_at"
> & {
  prequalified_at?: string | null;
  verified_at?: string | null;
};

type ActionConfig = {
  label: string;
  payload: SpgpaPayload;
  confirmTitle: string;
  confirmContent: string;
  variant: "primary" | "secondary";
  className?: string;
};

const rejectAction = (
  spgpa: ServiceProvidingGroupProductApplication,
): ActionConfig => ({
  label: "Reject",
  payload: {
    status: "rejected",
    // DB requires clearing timestamp fields when status becomes rejected
    ...(spgpa.prequalified_at && { prequalified_at: null }),
    ...(spgpa.verified_at && { verified_at: null }),
  },
  confirmTitle: "Reject application",
  confirmContent:
    "Are you sure you want to reject this application? The service provider will be notified.",
  variant: "secondary",
  className:
    "text-semantic-background-action-danger border-semantic-background-action-danger",
});

const getActionsForStatus = (
  spgpa: ServiceProvidingGroupProductApplication,
): ActionConfig[] => {
  const reject = rejectAction(spgpa);
  switch (spgpa.status) {
    case "requested":
      return [
        {
          label: "Start prequalification",
          payload: { status: "in_progress" },
          confirmTitle: "Start prequalification",
          confirmContent:
            "This will move the application to in progress. The service provider will be notified.",
          variant: "primary",
        },
        reject,
      ];
    case "in_progress":
      return [
        {
          label: "Mark prequalified",
          // DB requires prequalified_at to be set when status becomes prequalified
          payload: {
            status: "prequalified",
            prequalified_at: new Date().toISOString(),
          },
          confirmTitle: "Mark as prequalified",
          confirmContent: "This will mark the application as prequalified.",
          variant: "primary",
        },
        reject,
      ];
    default:
      return [];
  }
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
  const queryClient = useQueryClient();
  const { buttonProps, dialog } = useConfirmAction({
    title: config.confirmTitle,
    content: config.confirmContent,
    confirmText: config.label,
    onConfirmMutation: {
      mutationFn: () =>
        updateServiceProvidingGroupProductApplication({
          path: { id: spgpaId },
          body: config.payload as ServiceProvidingGroupProductApplicationUpdateRequest,
        }).then(throwOnError),
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: spgpaQueryKey(spgpaId),
        });
        void queryClient.invalidateQueries({
          queryKey: ["service_providing_group", spgId],
        });
      },
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
  const actions = getActionsForStatus(spgpa);

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
          <ActionButton
            key={config.payload.status}
            config={config}
            spgpaId={spgpa.id}
            spgId={spgpa.service_providing_group_id}
          />
        ))}
      </div>
    </div>
  );
};
