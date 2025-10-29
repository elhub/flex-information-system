#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate sql grants from a permission CSV."""

import csv
import sys
from typing import cast, Sequence

full_action_names = {"C": "INSERT", "R": "SELECT", "U": "UPDATE", "D": "DELETE"}

party_type_abbr = {
    "ANON": "anonymous",
    "BRP": "balance_responsible_party",
    "EU": "end_user",
    "ES": "energy_supplier",
    "ENT": "entity",
    "FISO": "flexibility_information_system_operator",
    "MO": "market_operator",
    "ORG": "organisation",
    "SO": "system_operator",
    "SP": "service_provider",
    "TP": "third_party",
    "IEN": "internal_event_notification",
}

history_enabled = [
    "controllable_unit",
    "controllable_unit_service_provider",
    "service_providing_group",
    "service_providing_group_membership",
    "service_providing_group_grid_prequalification",
    "service_providing_group_grid_suspension",
    "service_providing_group_grid_suspension_comment",
    "service_providing_group_product_suspension",
    "party",
    "party_membership",
    "technical_resource",
    "system_operator_product_type",
    "service_provider_product_application",
    "service_provider_product_application_comment",
    "service_provider_product_suspension",
    "service_provider_product_suspension_comment",
    "service_providing_group_product_application",
]


def read_csv(csvReader: csv.DictReader) -> dict[str, dict[str, dict[str, list[str]]]]:
    """Read the CSV file and return a data structure with SQL grants."""

    party_types = cast(Sequence[str], csvReader.fieldnames)[2:]

    # resource |-> party_type |-> action |-> [field]
    grants: dict[str, dict[str, dict[str, list[str]]]] = {}

    for row in csvReader:
        column = row["FIELD"]
        if column in ("", None, "_", "-"):
            column = "*"

        resource = row["RESOURCE"]
        resource_history = f"{resource}_history"

        # this maps FLA inheritance from the resource to the history resource
        history_column_mapping = {
            "id": f"{resource}_id",
            "recorded_at": "replaced_at",
            "recorded_by": "replaced_by",
        }

        if resource not in grants:
            grants[resource] = {}
            grants[resource_history] = {}

        for party_type in party_types:
            if party_type not in grants[resource]:
                grants[resource][party_type] = {
                    "INSERT": list(),
                    "SELECT": list(),
                    "UPDATE": list(),
                    "DELETE": list(),
                }

                grants[resource_history][party_type] = {
                    "INSERT": list(),
                    "SELECT": list(),
                    "UPDATE": list(),
                    "DELETE": list(),
                }

            for grant in row[party_type]:
                if grant not in full_action_names:
                    # skip non-CRUD authorisation (not translated into grants)
                    continue

                if grant == "R" and resource in history_enabled:
                    grants[resource_history][party_type]["SELECT"].append(column)
                    if column in history_column_mapping:
                        grants[resource_history][party_type]["SELECT"].append(
                            history_column_mapping[column]
                        )

                grants[resource][party_type][full_action_names[grant]].append(column)

    return grants


if __name__ == "__main__":
    csvReader = csv.DictReader(sys.stdin, delimiter=";")
    grants = read_csv(csvReader)

    for resource in grants.keys():
        for party_type in grants[resource].keys():
            for grant in grants[resource][party_type].keys():
                if "*" in grants[resource][party_type][grant]:
                    # grant for whole resource
                    columns = ""
                else:
                    fields = ",\n".join(
                        f"    {g}"
                        for g in grants[resource][party_type][grant]
                        if g != "*"
                    )
                    if len(fields) == 0:
                        # do not grant anything
                        columns = None
                    else:
                        # grant for specific fields
                        columns = f" (\n{fields}\n)"

                if columns is not None:
                    print(
                        f"\n-- changeset flex:api-grant-{resource.replace('_', '-').lower()}-{party_type.lower()}-{grant.lower()} endDelimiter:-- runAlways:true"
                        + f"\nGRANT {grant}{columns} ON TABLE\napi.{resource}\nTO flex_{party_type_abbr[party_type]};",
                        file=sys.stdout,
                    )
                    print(
                        f"\n-- changeset flex:flex-grant-{resource.replace('_', '-').lower()}-{party_type.lower()}-{grant.lower()} endDelimiter:-- runAlways:true"
                        + f"\nGRANT {grant} ON TABLE\nflex.{resource}\nTO flex_{party_type_abbr[party_type]};",
                        file=sys.stderr,
                    )
