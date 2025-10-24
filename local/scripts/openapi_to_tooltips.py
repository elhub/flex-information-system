# -*- coding: utf-8 -*-
import yaml
import sys
import j2


def extract_tooltips(resource):
    tooltips = {}
    for prop_name, prop in resource["properties"].items():
        tooltips[prop_name] = prop["description"]
    return tooltips


yaml.SafeDumper.ignore_aliases = lambda self, data: True
resources = yaml.safe_load(sys.stdin)
resources = resources["resources"]

tooltips = {}
for resource in resources:
    tooltips[resource["id"]] = extract_tooltips(resource)

    if resource.get("comments"):
        resource = yaml.safe_load(
            j2.template_str(resource, "comment_resource.j2.yml"),
        )["data"]
        tooltips[resource["id"]] = extract_tooltips(resource)

yaml.safe_dump(tooltips, sys.stdout, sort_keys=False)
