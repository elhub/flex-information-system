# -*- coding: utf-8 -*-
import yaml
import json
import sys

"""
This script copies the internationalisation labels from the resource YAML file
to a JSON file used by the frontend.
"""

output_file = "frontend/src/intl/field-labels.json"

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
        if len(resource_translations) > 0:
            translations[resource["id"]] = resource_translations

    with open(output_file, "w") as output_f:
        json.dump(translations, output_f, indent=4, ensure_ascii=False)
        print(file=output_f)
