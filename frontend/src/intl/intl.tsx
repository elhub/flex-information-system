import { useMemo, useState } from "react";
import fieldLabels from "./field-labels.json";
import { defaultI18nProvider } from "react-admin";

type AppLanguage = "en" | "nb" | "nn";

const appLanguage: AppLanguage =
  window.env.LANGUAGE ?? import.meta.env.LANGUAGE ?? "en";

export const useI18nProvider = () => {
  const [language, setLanguage] = useState<AppLanguage>(appLanguage);
  const labels: any = useMemo(() => fieldLabels[language], [language]);
  return {
    getLocales: () => [
      { locale: "en", name: "English" },
      { locale: "nb", name: "Norsk Bokmål" },
      { locale: "nn", name: "Norsk Nynorsk" },
    ],
    getLocale: () => language,
    changeLocale: async (locale: string) => setLanguage(locale as AppLanguage),
    translate: (key: string, options: any) => {
      if (!key.startsWith("field."))
        return defaultI18nProvider.translate(key, options);

      const parts = key.split(".");
      const resource = parts[1];
      const field = parts[2];

      return labels[resource]?.[field] ?? key;
    },
  };
};
