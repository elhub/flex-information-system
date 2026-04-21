import { useGetList } from "ra-core";
import {
    applicationTypes,
    inconsistencyTypes,
} from "./notice-groups";

export const useActiveNotices = () => {
    const { data, isLoading, error } = useGetList(
        "notice",
        {
            pagination: { page: 1, perPage: 500 },
            sort: { field: "id", order: "ASC" },
            filter: { status: "eq.active" },
        },
    );

    const applications = (data ?? []).filter((n) =>
        applicationTypes.includes(n.type),
    );

    const inconsistencies = (data ?? []).filter((n) =>
        inconsistencyTypes.includes(n.type),
    );

    return {
        applications,
        inconsistencies,
        isLoading,
        error,
    };
};
