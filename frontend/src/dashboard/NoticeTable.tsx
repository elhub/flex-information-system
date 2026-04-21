import { useNavigate } from "react-router-dom";
import { useGetMany } from "ra-core";
import { Table } from "../components/ui";
import { getNoticeGroupLabel } from "./notice-groups";

type NoticeRecord = {
    id: number;
    type: string;
    source?: string;
    party_id: number;
    recorded_at: string;
};

type NoticeTableProps = {
    notices: NoticeRecord[];
    showParty?: boolean;
};

const getMockDueDate = (recordedAt: string): string => {
    const date = new Date(recordedAt);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
};

export const NoticeTable = ({
    notices,
    showParty = false,
}: NoticeTableProps) => {
    const navigate = useNavigate();

    const partyIds = showParty
        ? [...new Set(notices.map((n) => n.party_id))]
        : [];

    const { data: parties } = useGetMany(
        "party",
        { ids: partyIds },
        { enabled: partyIds.length > 0 },
    );

    const partyMap = new Map(
        (parties ?? []).map((p) => [p.id, p.name]),
    );

    const handleRowClick = (notice: NoticeRecord) => {
        if (notice.source) {
            const resource = notice.source.split("/")[1];
            const id = notice.source.split("/")[2];
            navigate(`/${resource}/${id}/show`);
        }
    };

    if (notices.length === 0) {
        return (
            <p className="p-6 text-center text-gray-500">
                No active notices.
            </p>
        );
    }

    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader scope="col">
                        Type
                    </Table.ColumnHeader>
                    {showParty && (
                        <Table.ColumnHeader scope="col">
                            Party
                        </Table.ColumnHeader>
                    )}
                    <Table.ColumnHeader scope="col">
                        Due date
                    </Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {notices.map((notice) => (
                    <Table.Row
                        key={notice.id}
                        onClick={() =>
                            handleRowClick(notice)
                        }
                        className="cursor-pointer hover:bg-gray-50"
                    >
                        <Table.DataCell>
                            {getNoticeGroupLabel(
                                notice.type,
                            )}
                        </Table.DataCell>
                        {showParty && (
                            <Table.DataCell>
                                {partyMap.get(
                                    notice.party_id,
                                ) ?? `Party ${notice.party_id}`}
                            </Table.DataCell>
                        )}
                        <Table.DataCell>
                            {getMockDueDate(
                                notice.recorded_at,
                            )}
                        </Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
};
