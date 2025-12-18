import { useMemo, useState } from "react";
import { fieldLabels as allFieldLabels, FieldLabel } from "./field-labels";
import { enumLabels as allEnumLabels, EnumLabel } from "./enum-labels";
import {
  defaultI18nProvider,
  I18nProvider as RAI18nProvider,
} from "react-admin";
import { text, TextKey } from "./text";

type AppLanguage = "en" | "nb" | "nn";

const appLanguage: AppLanguage = "en";
// TODO: uncomment to actually use intl
// window.env.LANGUAGE ?? import.meta.env.LANGUAGE ?? "en";

export type I18nProvider = RAI18nProvider & {
  // return all possible values for an enumeration
  getEnumValues: (enumKey: string) => string[];
};

export const useI18nProvider = () => {
  const [language, setLanguage] = useState<AppLanguage>(appLanguage);

  const fieldLabels = useMemo(() => allFieldLabels[language], [language]);
  const enumLabels = useMemo(() => allEnumLabels[language], [language]);
  const customText = useMemo(() => text[language], [language]);

  return {
    getLocales: () => [
      { locale: "en", name: "English" },
      // TODO: uncomment to show language button
      // { locale: "nb", name: "Norsk Bokmål" },
      // { locale: "nn", name: "Norsk Nynorsk" },
    ],

    // TODO: uncomment to actually use intl
    // getLocale: () => language,
    getLocale: () => "en",

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

    getEnumValues: (enumKey: string) =>
      Object.keys(enumLabels).filter((key) => key.startsWith(enumKey)),
  };
};
