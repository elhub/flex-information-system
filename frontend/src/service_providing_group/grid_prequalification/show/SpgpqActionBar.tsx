import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslate } from "ra-core";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { Button, Textarea } from "../../../components/ui";
import {
  createServiceProvidingGroupGridPrequalificationComment,
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
  requiresComment?: boolean;
  commentPlaceholder?: string;
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
  translate: ReturnType<typeof useTranslate>,
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
          label: translate("text.spgpq_conditionally_approve_button"),
          payload: {
            status: "conditionally_approved",
            prequalified_at: new Date().toISOString(),
          },
          confirmTitle: translate("text.spgpq_conditionally_approve_title"),
          confirmContent: translate(
            "text.spgpq_conditionally_approve_description",
          ),
          variant: "primary",
          requiresComment: true,
          commentPlaceholder: translate(
            "text.spgpq_conditionally_approve_placeholder",
          ),
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
  const [comment, setComment] = useState("");
  const { buttonProps, dialog } = useConfirmAction({
    title: config.confirmTitle,
    content: config.requiresComment ? (
      <>
        <p className="mb-4">{config.confirmContent}</p>
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={config.commentPlaceholder}
          aria-label={config.commentPlaceholder}
          rows={4}
          maxLength={2048}
        />
      </>
    ) : (
      config.confirmContent
    ),
    confirmText: config.label,
    confirmDisabled: config.requiresComment && !comment.trim(),
    onConfirmMutation: {
      mutationFn: async () => {
        await updateServiceProvidingGroupGridPrequalification({
          path: { id: spgpqId },
          body: config.payload,
        }).then(throwOnError);

        if (config.requiresComment) {
          await createServiceProvidingGroupGridPrequalificationComment({
            body: {
              service_providing_group_grid_prequalification_id: spgpqId,
              content: comment.trim(),
              visibility: "any_involved_party",
            },
          }).then(throwOnError);
        }
      },
      onSuccess: () => setComment(""),
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: spgpqQueryKey(spgpqId),
        });
        void queryClient.invalidateQueries({
          queryKey: ["service_providing_group", spgId],
        });
        if (config.requiresComment) {
          void queryClient.invalidateQueries({
            queryKey: ["spgpq_comments", spgpqId],
          });
        }
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
  const translate = useTranslate();
  const actions = getActionsForStatus(spgpq, translate);

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
