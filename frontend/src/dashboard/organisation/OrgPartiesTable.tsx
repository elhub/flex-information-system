import { useNavigate } from "react-router-dom";
import { Column, SimpleTable } from "../../components/SimpleTable";
import type { Party } from "../../generated-client/types.gen";
import { EnumLabel } from "../../intl/enum-labels";
import { useTranslateEnum } from "../../intl/intl";

type Props = {
  parties: Party[];
};

export const OrgPartiesTable = ({ parties }: Props) => {
  const navigate = useNavigate();
  const translateEnum = useTranslateEnum();

  const columns: Column<Party>[] = [
    {
      key: "name",
      header: "Party",
      render: (_, row) => (
        <div>
          <div className="font-medium text-semantic-text">{row.name}</div>
          {row.business_id && (
            <div className="text-xs text-semantic-text-subtle mt-0.5">
              {row.business_id}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (value) => (
        <span>{translateEnum(`party.type.${String(value)}` as EnumLabel)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span>
          {translateEnum(`party.status.${String(value)}` as EnumLabel)}
        </span>
      ),
    },
  ];

  return (
    <SimpleTable
      columns={columns}
      data={parties.filter((p) => p.type !== "organisation")}
      empty="No parties found."
      className="w-full"
      rowClick={(party) => navigate(`/party/${party.id}/show`)}
    />
  );
};
