import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { BodyText, Button, DateTimePicker } from "../../../components/ui";
import {
  ServiceProvidingGroupProductApplication,
  ServiceProvidingGroupProductApplicationUpdateRequest,
  updateServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { throwOnError } from "../../../util";
import { spgpaQueryKey } from "./useSpgpaShowViewModel";

type ActionConfig = {
  label: string;
  payload: ServiceProvidingGroupProductApplicationUpdateRequest;
  confirmTitle: string;
  confirmContent: string;
  variant: "primary" | "secondary";
  className?: string;
  // whether the SO/FISO must input `complete_at` to confirm this action (cf SPGPA-VAL011)
  requiresCompleteAt: boolean;
};

const rejectAction: ActionConfig = {
  label: "Reject",
  payload: { status: "rejected" },
  confirmTitle: "Reject application",
  confirmContent:
    "Are you sure you want to reject this application? The service provider will be notified.",
  variant: "secondary",
  requiresCompleteAt: false,
};

const getActionsForStatus = (
  spgpa: ServiceProvidingGroupProductApplication,
): ActionConfig[] => {
  switch (spgpa.status) {
    case "requested":
      return [
        {
          label: "Start prequalification",
          payload: { status: "prequalification" },
          confirmTitle: "Start prequalification",
          confirmContent:
            "This will start prequalification on the service providing group. The service provider will be notified.",
          variant: "primary",
          requiresCompleteAt: true,
        },
        rejectAction,
      ];
    case "prequalification":
      return [
        {
          label: "Mark prequalified",
          payload: {
            status: "prequalified",
            prequalified_at: new Date().toISOString(),
          },
          confirmTitle: "Mark as prequalified",
          confirmContent: "This will mark the application as prequalified.",
          variant: "primary",
          requiresCompleteAt: true,
        },
        rejectAction,
      ];
    default:
      return [];
  }
};

const CompleteAtInput = ({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) => (
  <div className="flex flex-col gap-1">
    <BodyText>
      In order to confirm this action, you must provide the time from which the
      application can be considered complete.
    </BodyText>
    <DateTimePicker
      selected={value ? parseISO(value, { in: tz("Europe/Oslo") }) : undefined}
      onChange={(date) =>
        onChange(
          date
            ? formatISO(date, {
                representation: "complete",
                in: tz("Europe/Oslo"),
              })
            : null,
        )
      }
      size="large"
      navigateButtons={false}
      fixedPopperPosition
    />
  </div>
);

const ActionButton = ({
  config,
  spgpaId,
  spgId,
  defaultCompleteAt,
}: {
  config: ActionConfig;
  spgpaId: number;
  spgId: number;
  defaultCompleteAt: string;
}) => {
  const queryClient = useQueryClient();
  const [completeAt, setCompleteAt] = useState<string | null>(
    config.requiresCompleteAt ? defaultCompleteAt : null,
  );

  const payload = config.requiresCompleteAt
    ? { ...config.payload, complete_at: completeAt ?? undefined }
    : config.payload;

  const { buttonProps, dialog } = useConfirmAction({
    title: config.confirmTitle,
    content: (
      <div className="flex flex-col gap-4">
        <p>{config.confirmContent}</p>
        {config.requiresCompleteAt && (
          <CompleteAtInput value={completeAt} onChange={setCompleteAt} />
        )}
      </div>
    ),
    confirmText: config.label,
    confirmDisabled: !!config.requiresCompleteAt && !completeAt,
    onConfirmMutation: {
      mutationFn: () => {
        return updateServiceProvidingGroupProductApplication({
          path: { id: spgpaId },
          body: payload,
        }).then(throwOnError);
      },
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
            key={config.label}
            config={config}
            spgpaId={spgpa.id}
            spgId={spgpa.service_providing_group_id}
            defaultCompleteAt={spgpa.created_at}
          />
        ))}
      </div>
    </div>
  );
};
