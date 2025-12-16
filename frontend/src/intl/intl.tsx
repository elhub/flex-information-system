import { useMemo, useState } from "react";
import { fieldLabels as allFieldLabels, FieldLabel } from "./field-labels";
import { enumLabels as allEnumLabels, EnumLabel } from "./enum-labels";
import { defaultI18nProvider } from "react-admin";
import { text, TextKey } from "./text";

type AppLanguage = "en" | "nb" | "nn";

const appLanguage: AppLanguage =
  window.env.LANGUAGE ?? import.meta.env.LANGUAGE ?? "en";

export const useI18nProvider = () => {
  const [language, setLanguage] = useState<AppLanguage>(appLanguage);

  const fieldLabels = useMemo(() => allFieldLabels[language], [language]);
  const enumLabels = useMemo(() => allEnumLabels[language], [language]);
  const customText = useMemo(() => text[language], [language]);

  return {
    getLocales: () => [
      { locale: "en", name: "English" },
      { locale: "nb", name: "Norsk Bokmål" },
      { locale: "nn", name: "Norsk Nynorsk" },
    ],

    getLocale: () => language,

    changeLocale: async (locale: string) => setLanguage(locale as AppLanguage),

    translate: (key: string, options: any) => {
      if (key.startsWith("field."))
        // resource field
        return fieldLabels[key.slice("field.".length) as FieldLabel] ?? key;

      if (key.startsWith("enum."))
        // enum value
        return enumLabels[key.slice("enum.".length) as EnumLabel] ?? key;

      if (key.startsWith("text."))
        // custom text
        return customText[key.slice("text.".length) as TextKey] ?? key;

      // default case: resort to React-Admin
      return defaultI18nProvider.translate(key, options);
    },
  };
};
