import { useSearchParams } from "react-router-dom";

export const useTabSearchParam = (defaultValue: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? defaultValue;
  const setTab = (value: string) =>
    setSearchParams({ tab: value }, { replace: true });
  return [tab, setTab] as const;
};
