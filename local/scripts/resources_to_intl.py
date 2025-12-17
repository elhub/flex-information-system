# -*- coding: utf-8 -*-
import yaml
import json
import sys
from copy import deepcopy

"""
This script copies the internationalisation labels from the resource YAML file
to TypeScript files used by the frontend.
"""

output_file_field_labels = "frontend/src/intl/field-labels.ts"
output_file_enum_labels = "frontend/src/intl/enum-labels.ts"

# ------------------------------------------------------------------------------

# field translations


# transpose a dictionary to switch between the following two types:
#   input:  resource |-> (field    |-> (language |-> label))
#   output: language |-> ("resource.field" |-> label)
def transpose_field_translations(tr):
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


comment_translations = {
    "id": {
        "en": "ID",
        "nb": "ID",
        "nn": "ID",
    },
    "created_by": {
        "en": "Created by",
        "nb": "Opprettet av",
        "nn": "Oppretta av",
    },
    "visibility": {
        "en": "Visibility",
        "nb": "Synlighet",
        "nn": "Synlegheit",
    },
    "content": {
        "en": "Content",
        "nb": "Innhold",
        "nn": "Innhald",
    },
    "created_at": {
        "en": "Created at",
        "nb": "Opprettet",
        "nn": "Oppretta",
    },
    "recorded_at": {
        "en": "Recorded at",
        "nb": "Registrert",
        "nn": "Registrert",
    },
    "recorded_by": {
        "en": "Recorded by",
        "nb": "Registrert av",
        "nn": "Registrert av",
    },
}


# generate field translations and write them to output file
def generate_field_translations(resources):
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
        if "history" in resource:
            resource_translations = deepcopy(resource_translations)
            resource_translations[f"{resource['id']}_id"] = resource["x-intl"]
            resource_translations["replaced_at"] = {
                "en": "Replaced at",
                "nb": "Erstattet",
                "nn": "Erstattet",
            }
            resource_translations["replaced_by"] = {
                "en": "Replaced by",
                "nb": "Erstattet av",
                "nn": "Erstattet av",
            }
            translations[f"{resource['id']}_history"] = resource_translations
        if resource.get("comments"):
            comment_resource_translations = deepcopy(comment_translations)
            comment_resource_translations[f"{resource['id']}_id"] = resource["x-intl"]
            translations[f"{resource['id']}_comment"] = comment_resource_translations
            # comment history
            comment_resource_translations = deepcopy(comment_resource_translations)
            comment_resource_translations[f"{resource['id']}_comment_id"] = {
                "en": "Comment ID",
                "nb": "Kommentar-ID",
                "nn": "Kommentar-ID",
            }
            comment_resource_translations["replaced_at"] = {
                "en": "Replaced at",
                "nb": "Erstattet",
                "nn": "Erstattet",
            }
            comment_resource_translations["replaced_by"] = {
                "en": "Replaced by",
                "nb": "Erstattet av",
                "nn": "Erstattet av",
            }
            translations[f"{resource['id']}_comment_history"] = (
                comment_resource_translations
            )

    transposed, keys = transpose_field_translations(translations)

    with open(output_file_field_labels, "w") as output_f:
        output_f.write("// AUTO-GENERATED FILE (scripts/resources_to_intl.py)\n\n")
        output_f.write("export type FieldLabel =\n")
        for key in keys:
            output_f.write(f'  | "{key}"\n')
        output_f.write(";\n\n")

        output_f.write(
            "export const fieldLabels: Record<string, Record<FieldLabel, string>> = "
        )
        json.dump(transposed, output_f, indent=2, ensure_ascii=False)
        output_f.write(";\n")


# ------------------------------------------------------------------------------

# enum translations


# transpose a dictionary to switch between the following two types:
#   input:  "resource.field.value" |-> (language |-> label)
#   output: language |-> ("resource.field.value" |-> label)
def transpose_enum_translations(tr):
    translations = {}
    for value, value_language_labels in tr.items():
        for lang, label in value_language_labels.items():
            if lang not in translations:
                translations[lang] = {}
            translations[lang][value] = label
    return translations


# generate enum translations and write them to output file
def generate_enum_translations(resources):
    translations = {}
    for resource in resources:
        for field, attr in resource["properties"].items():
            if "enum" in attr:
                for enum_value in attr["enum"]:
                    translations[f"{resource['id']}.{field}.{enum_value['id']}"] = (
                        enum_value["x-intl"]
                    )

    transposed = transpose_enum_translations(translations)

    with open(output_file_enum_labels, "w") as output_f:
        output_f.write("// AUTO-GENERATED FILE (scripts/resources_to_intl.py)\n\n")
        output_f.write("export type EnumLabel =\n")
        for key in sorted(translations.keys()):
            output_f.write(f'  | "{key}"\n')
        output_f.write(";\n\n")

        output_f.write(
            "export const enumLabels: Record<string, Record<EnumLabel, string>> = "
        )
        json.dump(transposed, output_f, indent=2, ensure_ascii=False)
        output_f.write(";\n")


# ------------------------------------------------------------------------------

if __name__ == "__main__":
    yaml.SafeDumper.ignore_aliases = lambda self, data: True
    resources = yaml.safe_load(sys.stdin)
    resources = resources["resources"]

    generate_field_translations(resources)
    generate_enum_translations(resources)
