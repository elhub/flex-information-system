import { useQueryClient } from "@tanstack/react-query";
import { Button, VerticalSpace } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { useConfirmAction } from "../../components/ConfirmAction";
import { updateParty } from "../../generated-client";
import { useParty } from "../../hooks/party";
import { useTranslateEnum } from "../../intl/intl";
import { throwOnError } from "../../util";

type NoticePartyResidualProps = {
  source?: string;
};

const getPartyIdFromSource = (source?: string) => {
  const partyId = Number(source?.split("/")[2]);
  return Number.isInteger(partyId) ? partyId : undefined;
};

// component to show details of a notice of type no.elhub.flex.party.residual
export const NoticePartyResidual = ({ source }: NoticePartyResidualProps) => {
  const queryClient = useQueryClient();
  const translateEnum = useTranslateEnum();
  const partyId = getPartyIdFromSource(source);
  const { data: party, isPending, error } = useParty(partyId);

  const { buttonProps, dialog } = useConfirmAction({
    title: "Terminate party",
    content:
      "This will update the party status to terminated. It may take a minute or two for the notice to resolve itself.",
    confirmText: "Terminate party",
    successMessage: "Party updated to terminated.",
    onConfirmMutation: {
      mutationFn: async () => {
        if (partyId == undefined) throw new Error("No party found in notice");

        return await updateParty({
          path: { id: partyId },
          body: { status: "terminated" },
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
        <LabelValue size="small" labelKey="party.name" value={party?.name} />
        <LabelValue
          size="small"
          labelKey="party.type"
          value={
            party?.type ? translateEnum(`party.type.${party.type}`) : undefined
          }
        />
        <LabelValue
          size="small"
          label={
            party?.business_id_type
              ? translateEnum(
                  `party.business_id_type.${party.business_id_type}`,
                )
              : undefined
          }
          value={party?.business_id}
        />
        <LabelValue
          size="small"
          labelKey="party.status"
          value={
            party?.status
              ? translateEnum(`party.status.${party.status}`)
              : undefined
          }
        />
      </div>

      <Button disabled={party?.status === "terminated"} {...buttonProps}>
        Terminate party
      </Button>

      {dialog}
    </>
  );
};
