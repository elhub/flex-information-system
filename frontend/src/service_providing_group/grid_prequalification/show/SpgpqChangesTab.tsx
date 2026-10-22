import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslate } from "ra-core";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { Button, Loader, Textarea } from "../../../components/ui";
import {
  createServiceProvidingGroupGridPrequalificationComment,
  listServiceProvidingGroupProductApplication,
  ServiceProvidingGroupGridPrequalification,
  updateServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { KILO } from "../../../utils/scales";
import { throwOnError } from "../../../util";
import { SpgChangesView } from "../../shared/changes/SpgChangesView";
import { spgpqQueryKey } from "./useSpgpqShowViewModel";
import { useSpgpqMilestones } from "./useSpgpqMilestones";
import { useSpgChangesViewModel } from "../../shared/changes/useSpgChangesViewModel";

const ApproveChangesButton = ({
  spgpq,
}: {
  spgpq: ServiceProvidingGroupGridPrequalification;
}) => {
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { buttonProps, dialog } = useConfirmAction({
    title: translate("text.spgpq_changes_approve_title"),
    content: (
      <>
        <p className="mb-4">
          {translate("text.spgpq_changes_approve_description")}
        </p>
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={translate("text.spgpq_changes_approve_placeholder")}
          aria-label={translate("text.spgpq_changes_approve_placeholder")}
          rows={4}
          maxLength={2048}
        />
      </>
    ),
    confirmText: translate("text.spgpq_changes_approve_button"),
    onConfirmMutation: {
      mutationFn: async () => {
        await updateServiceProvidingGroupGridPrequalification({
          path: { id: spgpq.id },
          body: { prequalified_at: new Date().toISOString() },
        }).then(throwOnError);

        if (comment.trim()) {
          await createServiceProvidingGroupGridPrequalificationComment({
            body: {
              service_providing_group_grid_prequalification_id: spgpq.id,
              content: comment.trim(),
              visibility: "any_involved_party",
            },
          }).then(throwOnError);
        }
      },
      onSuccess: () => setComment(""),
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: spgpqQueryKey(spgpq.id),
        });
        void queryClient.invalidateQueries({
          queryKey: ["spgpq_comments", spgpq.id],
        });
      },
    },
  });

  return (
    <div className="flex justify-end">
      <Button variant="primary" {...buttonProps}>
        {translate("text.spgpq_changes_approve_button")}
      </Button>
      {dialog}
    </div>
  );
};

// Whether the ISO is the procuring system operator on a product application of
// the SPG. It is then responsible for the whole group and not only for the CUs
// where it is the CSO.
const useIsProcuringSystemOperator = (
  spgpq: ServiceProvidingGroupGridPrequalification,
) =>
  useQuery({
    queryKey: [
      "spgpq_is_pso",
      spgpq.service_providing_group_id,
      spgpq.impacted_system_operator_id,
    ],
    queryFn: () =>
      listServiceProvidingGroupProductApplication({
        query: {
          service_providing_group_id: `eq.${spgpq.service_providing_group_id}`,
          procuring_system_operator_id: `eq.${spgpq.impacted_system_operator_id}`,
          limit: "1",
        },
      })
        .then(throwOnError)
        .then((applications) => applications.length > 0),
  });

// The time of the approval, in the same format as the view's range
const spgApprovedAt = (spgpq: ServiceProvidingGroupGridPrequalification) =>
  spgpq.prequalified_at
    ? new Date(spgpq.prequalified_at).toISOString()
    : undefined;

// Whether anything differs between the approved state and now, i.e., whether
// there is anything to approve. Independent of the range selected in the view.
// With the default range this is the same query as the view's, so the request
// is shared.
const useHasUnapprovedChanges = (
  spgpq: ServiceProvidingGroupGridPrequalification,
  now: string,
  systemOperatorId: number | undefined,
  // false until the scope is known, so that we don't fetch with the wrong one
  scopeReady: boolean,
) => {
  const approvedAt = spgApprovedAt(spgpq);

  // the query is disabled without a "from"
  const { data } = useSpgChangesViewModel(
    spgpq.service_providing_group_id,
    scopeReady ? approvedAt : undefined,
    now,
    systemOperatorId,
  );

  return data?.some((row) => row.status !== "unchanged") ?? false;
};

type Props = {
  spgpq: ServiceProvidingGroupGridPrequalification;
  canApprove: boolean;
};

// Changes in the SPG since it was grid prequalified (approved by the ISO).
// "Approve all changes" sets the grid prequalification time to now, which
// resolves the notice that the grid prequalification is outdated.
// The approve button is only shown when there are changes to approve.
// Only the CUs where the ISO is the CSO are included, unless the ISO is the PSO.
export const SpgpqChangesTab = ({ spgpq, canApprove }: Props) => {
  const [now] = useState(() => new Date().toISOString());
  const milestones = useSpgpqMilestones(spgpq, now);
  const { data: isPso, isPending } = useIsProcuringSystemOperator(spgpq);
  const systemOperatorId = isPso
    ? undefined
    : spgpq.impacted_system_operator_id;
  const hasChanges = useHasUnapprovedChanges(
    spgpq,
    now,
    systemOperatorId,
    !isPending,
  );

  if (isPending) return <Loader />;

  return (
    <SpgChangesView
      spgId={spgpq.service_providing_group_id}
      milestones={milestones}
      initialFrom={spgApprovedAt(spgpq)}
      now={now}
      powerScale={KILO}
      systemOperatorId={systemOperatorId}
      actions={
        canApprove && hasChanges ? <ApproveChangesButton spgpq={spgpq} /> : null
      }
    />
  );
};
