import {
    useAuthenticated,
    useGetIdentity,
} from "ra-core";
import {
    Alert,
    Badge,
    BodyText,
    Heading,
    Loader,
    Tabs,
} from "../components/ui";
import { IconInformationCircle } from "@elhub/ds-icons";
import { NoticeTable } from "./NoticeTable";
import { useActiveNotices } from "./useActiveNotices";

export const Dashboard = () => {
    useAuthenticated();

    const { data: identity } = useGetIdentity();
    const { applications, inconsistencies, isLoading, error } =
        useActiveNotices();

    const isSystemOperator =
        identity?.role === "flex_system_operator";

    return (
        <div id="flex-dashboard">
            <div className="flex flex-col gap-5 p-4">
                <Heading level={2} size="small">
                    Welcome to the Flexibility
                    Information System
                </Heading>
                <BodyText>
                    Use the menu on the left to list,
                    view, create and update resources.
                </BodyText>

                {isLoading && <Loader size="medium" />}

                {error && (
                    <Alert variant="error">
                        Failed to load notices.
                    </Alert>
                )}

                {!isLoading &&
                    !error &&
                    isSystemOperator && (
                        <Tabs defaultValue="applications">
                            <Tabs.List>
                                <Tabs.Tab
                                    value="applications"
                                    label={`Applications (${applications.length})`}
                                />
                                <Tabs.Tab
                                    value="inconsistencies"
                                    label={`Inconsistencies (${inconsistencies.length})`}
                                />
                            </Tabs.List>
                            <Tabs.Panel value="applications">
                                <NoticeTable
                                    notices={applications}
                                />
                            </Tabs.Panel>
                            <Tabs.Panel value="inconsistencies">
                                <NoticeTable
                                    notices={inconsistencies}
                                    showParty
                                />
                            </Tabs.Panel>
                        </Tabs>
                    )}

                {!isLoading &&
                    !error &&
                    !isSystemOperator && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Heading
                                    level={3}
                                    size="small"
                                >
                                    Inconsistencies
                                </Heading>
                                <Badge
                                    icon={IconInformationCircle}
                                    status="pending"
                                    variant="block"
                                    size="small"
                                >
                                    {inconsistencies.length}
                                </Badge>
                            </div>
                            <NoticeTable
                                notices={inconsistencies}
                            />
                        </div>
                    )}
            </div>
        </div>
    );
};
