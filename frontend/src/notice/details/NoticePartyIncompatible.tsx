import { useTranslate } from "ra-core";
import { BodyText } from "../../components/ui";
import { SimpleTable } from "../../components/SimpleTable";
import { useTranslateEnum } from "../../intl/intl";
import { NoticeDataPartyIncompatible } from "../../generated-client";

type NoticePartyIncompatibleProps = {
  noticeData: NoticeDataPartyIncompatible;
};

// component to show details of a notice of type no.elhub.flex.party.incompatible
export const NoticePartyIncompatible = ({
  noticeData,
}: NoticePartyIncompatibleProps) => {
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();
  const { entity } = noticeData;
  const party = (noticeData.party ?? []).map((p) => ({
    ...p,
    id: `${p.type}/${p.business_id}`,
  }));

  const entityLabel = entity?.business_id
    ? `${entity.name} (${entity.business_id_type?.toUpperCase()} ${entity.business_id})`
    : entity?.name;

  return (
    <div className="flex flex-col gap-4">
      <BodyText>
        {translate("text.notice_party_incompatible_intro", {
          entity: entityLabel,
        })}
      </BodyText>
      <SimpleTable
        size="small"
        empty={translate("text.notice_party_incompatible_empty")}
        data={party}
        columns={[
          { key: "name", header: translate("field.party.name") },
          { key: "business_id", header: translate("field.party.business_id") },
          {
            key: "business_id_type",
            header: translate("field.party.business_id_type"),
            render: (_, row) =>
              translateEnum(`party.business_id_type.${row.business_id_type}`),
          },
          {
            key: "type",
            header: translate("field.party.type"),
            render: (_, row) => translateEnum(`party.type.${row.type}`),
          },
        ]}
      />
    </div>
  );
};
