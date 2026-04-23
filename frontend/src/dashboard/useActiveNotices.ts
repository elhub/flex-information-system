import { applicationTypes, inconsistencyTypes } from "./notice-groups";
import { useQuery } from "@tanstack/react-query";
import { listNotice } from "../generated-client";
import { throwOnError } from "../util";

export const useActiveNotices = () => {
  const { data, isLoading, error } = useQuery({
    queryFn: () => listNotice().then(throwOnError),
    queryKey: ["active-notices"],
  });

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
