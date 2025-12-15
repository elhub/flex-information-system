# -*- coding: utf-8 -*-
import yaml
import json
import sys

"""
This script copies the internationalisation labels from the resource YAML file
to a JSON file used by the frontend.
"""

output_file = "frontend/src/intl/field-labels.json"


# transpose a dictionary to switch between the following two types:
#   input:  resource |-> (field    |-> (language |-> label))
#   output: language |-> (resource |-> (field    |-> label))
def transpose_translations(tr):
    translations = {}
    for resource, resource_language_labels in tr.items():
        for field, language_labels in resource_language_labels.items():
            for lang, label in language_labels.items():
                # add the label, creating the nested structure if not exists
                if lang not in translations:
                    translations[lang] = {resource: {field: label}}
                elif resource not in translations[lang]:
                    translations[lang][resource] = {field: label}
                else:
                    translations[lang][resource][field] = label
    return translations


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

    with open(output_file, "w") as output_f:
        json.dump(
            transpose_translations(translations), output_f, indent=4, ensure_ascii=False
        )
        print(file=output_f)
