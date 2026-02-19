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
output_file_tooltips = "frontend/src/tooltip/tooltips.ts"
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


def transpose_descriptions(tr):
    descriptions = {}
    for resource, resource_descriptions in tr.items():
        for field, description in resource_descriptions.items():
            key = f"{resource}.{field}"
            descriptions[key] = description
    return descriptions


comment_descriptions = {
    "id": "Unique surrogate identifier.",
    "created_by": "The identity that created the comment.",
    "visibility": "The level of visibility of the comment.",
    "content": "Free text content of the comment.",
    "created_at": "When the comment was added to the resource.",
    "recorded_at": "When the resource was recorded (created or updated) in the system.",
    "recorded_by": "The identity that recorded the resource.",
}

history_descriptions = {
    "id": "Unique surrogate identifier.",
    "replaced_at": "When the resource was replaced.",
    "replaced_by": "The identity that replaced the resource.",
}

history_translations = {
    "id": {
        "en": "ID",
        "nb": "ID",
        "nn": "ID",
    },
    "replaced_at": {
        "en": "Replaced at",
        "nb": "Erstattet",
        "nn": "Erstattet",
    },
    "replaced_by": {
        "en": "Replaced by",
        "nb": "Erstattet av",
        "nn": "Erstattet av",
    },
}


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


def get_comment_history_translations(resource):
    return {
        f"{resource['id']}_comment_id": {
            "en": "Comment ID",
            "nb": "Kommentar-ID",
            "nn": "Kommentar-ID",
        },
        "replaced_at": {
            "en": "Replaced at",
            "nb": "Erstattet",
            "nn": "Erstattet",
        },
        "replaced_by": {
            "en": "Replaced by",
            "nb": "Erstattet av",
            "nn": "Erstattet av",
        },
    }


def get_comment_history_descriptions(resource):
    return {
        f"{resource['id']}_comment_id": "Comment ID",
        "replaced_at": "When the comment was replaced.",
        "replaced_by": "The identity that replaced the comment.",
    }


audit_descriptions = {
    "recorded_at": "When the resource was recorded (created or updated) in the system.",
    "recorded_by": "The identity that recorded the resource.",
}

audit_translations = {
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
    tooltips = {}
    for resource in resources:
        resource_translations = {}
        resource_tooltips = {}
        for field, attr in resource["properties"].items():
            resource_tooltips[field] = attr.get("description", None)
            if "x-intl" in attr:
                resource_translations[field] = attr["x-intl"]
        if resource.get("audit"):
            resource_translations = dict(resource_translations, **audit_translations)
            resource_tooltips = dict(resource_tooltips, **audit_descriptions)
        if len(resource_translations) > 0:
            translations[resource["id"]] = resource_translations
            tooltips[resource["id"]] = resource_tooltips
        if "history" in resource:
            resource_translations = deepcopy(resource_translations)
            resource_translations[f"{resource['id']}_id"] = resource["x-intl"]
            resource_tooltips = deepcopy(resource_tooltips)
            resource_tooltips[f"{resource['id']}_id"] = "Unique surrogate identifier."

            resource_translations = dict(resource_translations, **history_translations)
            resource_tooltips = dict(resource_tooltips, **history_descriptions)
            translations[f"{resource['id']}_history"] = resource_translations
            tooltips[f"{resource['id']}_history"] = resource_tooltips
        if resource.get("comments"):
            comment_resource_translations = deepcopy(comment_translations)
            comment_resource_translations[f"{resource['id']}_id"] = resource["x-intl"]
            translations[f"{resource['id']}_comment"] = comment_resource_translations

            comment_resource_tooltips = deepcopy(comment_descriptions)
            comment_resource_tooltips[f"{resource['id']}_id"] = (
                "Unique surrogate identifier."
            )
            tooltips[f"{resource['id']}_comment"] = comment_resource_tooltips

            # comment history
            comment_resource_translations = dict(
                comment_resource_translations,
                **get_comment_history_translations(resource),
            )
            translations[f"{resource['id']}_comment_history"] = (
                comment_resource_translations
            )

            comment_resource_tooltips = dict(
                comment_resource_tooltips, **get_comment_history_descriptions(resource)
            )
            tooltips[f"{resource['id']}_comment_history"] = comment_resource_tooltips

    transposed, keys = transpose_field_translations(translations)
    descriptions = transpose_descriptions(tooltips)

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

    with open(output_file_tooltips, "w") as output_f:
        output_f.write("// AUTO-GENERATED FILE (scripts/resources_to_intl.py)\n\n")
        output_f.write("export const tooltips = ")
        json.dump(descriptions, output_f, indent=2, ensure_ascii=False)
        output_f.write("; ")
        output_f.write("export type TooltipKey = keyof typeof tooltips;\n")


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


comment_visibility_enum_translation = {
    "comment.visibility.same_party": {
        "en": "Same party",
        "nb": "Samme aktør",
        "nn": "Same aktør",
    },
    "comment.visibility.any_involved_party": {
        "en": "Any involved party",
        "nb": "Alle involverte aktører",
        "nn": "Alle involverte aktørar",
    },
}


# generate enum translations and write them to output file
def generate_enum_translations(resources):
    translations = comment_visibility_enum_translation
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
