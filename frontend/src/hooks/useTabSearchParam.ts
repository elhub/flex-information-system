import { useSearchParams } from "react-router-dom";

export const useTabSearchParam = (defaultValue: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? defaultValue;
  const setTab = (value: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", value);
        return next;
      },
      { replace: true },
    );
  return [tab, setTab] as const;
};
