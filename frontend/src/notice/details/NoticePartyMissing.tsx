import { useNavigate } from "react-router-dom";
import { IconPlus } from "@elhub/ds-icons";
import { BodyText, Button, Heading, VerticalSpace } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { useConfirmAction } from "../../components/ConfirmAction";
import { useTranslateEnum } from "../../intl/intl";
import { createParty, NoticeDataPartyMissing } from "../../generated-client";
import { throwOnError } from "../../util";

type NoticePartyMissingProps = {
  noticeData: NoticeDataPartyMissing;
};

// component to show details of a notice of type no.elhub.flex.party.missing
export const NoticePartyMissing = ({ noticeData }: NoticePartyMissingProps) => {
  const translateEnum = useTranslateEnum();
  const navigate = useNavigate();

  const { buttonProps, dialog } = useConfirmAction({
    title: "Create party",
    content: "Are you sure you want to create this party in the system?",
    onConfirmMutation: {
      mutationFn: async () => {
        if (noticeData.party == undefined)
          throw new Error("No party data available");
        const { business_id, business_id_type, entity_id, name, type } =
          noticeData.party;
        return await createParty({
          body: {
            business_id: business_id,
            business_id_type: business_id_type,
            entity_id: entity_id,
            name: name,
            role: `flex_${type}`,
            type: type,
            status: "active",
          },
        }).then(throwOnError);
      },
      onSuccess: (created) => {
        navigate(`/party/${(created as { id: number }).id}/show`);
      },
    },
  });

  return (
    <>
      <Heading level={3} size="xsmall" spacing>
        A party is missing in the system.
      </Heading>
      <BodyText>
        This party is present in the party register, but is not yet created in
        the flexibility information system. Review the information below and use
        the button to create the party.
      </BodyText>
      <VerticalSpace />

      <VerticalSpace size="small" />
      <div className="flex flex-col gap-4 mb-4">
        <LabelValue
          size="small"
          labelKey="party.name"
          value={noticeData.party?.name}
        />
        <LabelValue
          size="small"
          labelKey="party.type"
          value={
            noticeData.party?.type
              ? translateEnum(`party.type.${noticeData.party.type}`)
              : undefined
          }
        />
        <LabelValue
          size="small"
          label={
            noticeData.party?.business_id_type
              ? translateEnum(
                  `party.business_id_type.${noticeData.party.business_id_type}`,
                )
              : undefined
          }
          value={noticeData.party?.business_id}
        />

        <LabelValue
          size="small"
          label={
            noticeData.entity?.business_id_type
              ? translateEnum(
                  `entity.business_id_type.${noticeData.entity.business_id_type}`,
                )
              : undefined
          }
          value={noticeData.entity?.business_id}
        />
      </div>
      {noticeData.party == undefined ? null : (
        <Button icon={IconPlus} {...buttonProps}>
          Create party
        </Button>
      )}

      {dialog}
    </>
  );
};
