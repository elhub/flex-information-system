# -*- coding: utf-8 -*-
import yaml
import json
import sys

"""
This script copies the internationalisation labels from the resource YAML file
to a TypeScript file used by the frontend.
"""

output_file = "frontend/src/intl/field-labels.ts"


# transpose a dictionary to switch between the following two types:
#   input:  resource |-> (field    |-> (language |-> label))
#   output: language |-> ("resource.field" |-> label)
def transpose_translations(tr):
    translations = {}
    all_keys = set()
    for resource, resource_language_labels in tr.items():
        for field, language_labels in resource_language_labels.items():
            key = f"{resource}.{field}"
            all_keys.add(key)
            for lang, label in language_labels.items():
                if lang not in translations:
                    translations[lang] = {}
                translations[lang][key] = label
    return translations, sorted(list(all_keys))


# ------------------------------------------------------------------------------

if __name__ == "__main__":
    yaml.SafeDumper.ignore_aliases = lambda self, data: True
    resources = yaml.safe_load(sys.stdin)
    resources = resources["resources"]

    translations = {}
    for resource in resources:
        resource_translations = {}
        for field, attr in resource["properties"].items():
            if "x-intl" in attr:
                resource_translations[field] = attr["x-intl"]
        if resource.get("audit"):
            resource_translations["recorded_at"] = {
                "en": "Recorded at",
                "nb": "Registrert",
                "nn": "Registrert",
            }
            resource_translations["recorded_by"] = {
                "en": "Recorded by",
                "nb": "Registrert av",
                "nn": "Registrert av",
            }
        if len(resource_translations) > 0:
            translations[resource["id"]] = resource_translations

    transposed, keys = transpose_translations(translations)

    with open(output_file, "w") as output_f:
        output_f.write("// AUTO-GENERATED FILE (scripts/resources_to_intl.py)\n\n")
        output_f.write("export type FieldLabel =\n")
        for i, key in enumerate(keys):
            output_f.write(f'  | "{key}"\n')
        output_f.write(";\n\n")

        output_f.write(
            "export const fieldLabels: Record<string, Record<FieldLabel, string>> = "
        )
        json.dump(transposed, output_f, indent=2, ensure_ascii=False)
        output_f.write(";\n")
