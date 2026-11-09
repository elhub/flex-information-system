import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslate } from "ra-core";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { useConfirmAction } from "../../../components/ConfirmAction";
import {
  BodyText,
  Button,
  DateTimePicker,
  FormItem,
  FormItemLabel,
  Textarea,
} from "../../../components/ui";
import {
  createServiceProvidingGroupProductApplicationComment,
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
  // whether the SO/FISO must add a comment (visible to all involved parties)
  requiresComment?: boolean;
  commentPlaceholder?: string;
};

const getRejectAction = (
  translate: ReturnType<typeof useTranslate>,
): ActionConfig => ({
  label: "Reject",
  payload: { status: "rejected" },
  confirmTitle: translate("text.spgpa_reject_title"),
  confirmContent: translate("text.spgpa_reject_description"),
  variant: "secondary",
  requiresCompleteAt: false,
  requiresComment: true,
  commentPlaceholder: translate("text.spgpa_reject_placeholder"),
});

const getActionsForStatus = (
  spgpa: ServiceProvidingGroupProductApplication,
  translate: ReturnType<typeof useTranslate>,
): ActionConfig[] => {
  const rejectAction = getRejectAction(translate);
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
          requiresCompleteAt: false,
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
  <FormItem id="spgpa-complete-at" size="large">
    <BodyText>
      In order to confirm this action, you must provide the time from which the
      application can be considered complete.
    </BodyText>
    <FormItemLabel htmlFor="spgpa-complete-at">Complete at</FormItemLabel>
    <DateTimePicker
      id="spgpa-complete-at"
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
  </FormItem>
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

  const [comment, setComment] = useState("");

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
        {config.requiresComment && (
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={config.commentPlaceholder}
            aria-label={config.commentPlaceholder}
            rows={4}
            maxLength={2048}
          />
        )}
      </div>
    ),
    confirmText: config.label,
    confirmDisabled:
      (!!config.requiresCompleteAt && !completeAt) ||
      (!!config.requiresComment && !comment.trim()),
    onConfirmMutation: {
      mutationFn: async () => {
        await updateServiceProvidingGroupProductApplication({
          path: { id: spgpaId },
          body: payload,
        }).then(throwOnError);

        if (config.requiresComment) {
          await createServiceProvidingGroupProductApplicationComment({
            body: {
              service_providing_group_product_application_id: spgpaId,
              content: comment.trim(),
              visibility: "any_involved_party",
            },
          }).then(throwOnError);
        }
      },
      onSuccess: () => setComment(""),
      onSettled: () => {
        if (config.requiresComment) {
          void queryClient.invalidateQueries({
            queryKey: ["spgpa_comments", spgpaId],
          });
        }
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
  const translate = useTranslate();
  const actions = getActionsForStatus(spgpa, translate);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
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
  );
};
