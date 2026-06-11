import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, VerticalSpace } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { useConfirmAction } from "../../components/ConfirmAction";
import {
  updateParty,
  readEntity,
  NoticeDataPartyOutdated,
} from "../../generated-client";
import { useParty } from "../../hooks/party";
import { throwOnError } from "../../util";

type NoticePartyOutdatedProps = {
  source?: string;
  noticeData: NoticeDataPartyOutdated;
};

const getPartyIdFromSource = (source?: string) => {
  const partyId = Number(source?.split("/")[2]);
  return Number.isInteger(partyId) ? partyId : undefined;
};

// component to show details of a notice of type no.elhub.flex.party.outdated
export const NoticePartyOutdated = ({
  source,
  noticeData,
}: NoticePartyOutdatedProps) => {
  const queryClient = useQueryClient();
  const partyId = getPartyIdFromSource(source);
  const { data: party, isPending, error } = useParty(partyId);

  const entityChanged = noticeData.entity != undefined;
  const { data: currentEntity } = useQuery({
    queryKey: ["entity", party?.entity_id],
    queryFn: () => {
      if (!party) throw new Error("Party not loaded");
      return readEntity({ path: { id: party.entity_id } }).then(throwOnError);
    },
    enabled: !!party && entityChanged,
  });

  const { buttonProps, dialog } = useConfirmAction({
    title: "Update party",
    content:
      "This will update the party. It may take a minute or two for the notice to resolve itself.",
    confirmText: "Update party",
    successMessage: "Party updated.",
    onConfirmMutation: {
      mutationFn: async () => {
        if (partyId == undefined) throw new Error("No party found in notice");

        const body: Record<string, unknown> = {};
        if (noticeData.party?.name != undefined)
          body.name = noticeData.party.name;
        if (noticeData.party?.entity_id != undefined)
          body.entity_id = noticeData.party.entity_id;

        return await updateParty({
          path: { id: partyId },
          body,
        }).then(throwOnError);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: ["party", partyId] });
        void queryClient.invalidateQueries({ queryKey: ["notice"] });
      },
    },
  });

  if (partyId == undefined) {
    return null;
  }

  if (isPending) {
    return null;
  }

  if (error) {
    throw error;
  }

  return (
    <>
      <VerticalSpace size="small" />
      <div className="flex flex-col gap-4 mb-4">
        {noticeData.party?.name != undefined && (
          <LabelValue
            size="small"
            label="Name"
            value={`${party?.name} → ${noticeData.party.name}`}
          />
        )}
        {noticeData.entity != undefined && (
          <LabelValue
            size="small"
            label="Organisation"
            value={`${currentEntity?.name ?? "…"} → ${noticeData.entity.name}`}
          />
        )}
      </div>

      <Button {...buttonProps}>Update party</Button>

      {dialog}
    </>
  );
};
