import { useEffect, useState } from "react";

export const PrivacyPolicyPage = () => {
  const [html, setHtml] = useState("");

  const lang =
    navigator.language.startsWith("nb") || navigator.language.startsWith("nn")
      ? "no"
      : "en";

  useEffect(() => {
    fetch(`/static-assets/privacy-policy.${lang}.html`)
      .then((res) => res.text())
      .then(setHtml);
  }, [lang]);

  return (
    <div
      className="prose max-w-3xl mx-auto px-6 py-10"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
