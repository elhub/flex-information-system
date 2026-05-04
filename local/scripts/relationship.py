# Common stuff for dealing with relationships between resources

from dataclasses import dataclass
from typing import List


@dataclass
class Field:
    """Describes a field in a resource."""

    resource: str
    name: str


@dataclass
class Relationship:
    """Describes a relationship between two resources."""

    child: Field
    name: str
    parent: Field
    cardinality: str


def from_foreign_key(
    child: str, child_field: str, parent: str, parent_field: str, cardinality: str
) -> List[Relationship]:
    """Create Relationships from a foreign key definition."""

    parent_cardinality, child_cardinality = cardinality.split("-to-")

    rels = []
    rels.append(
        Relationship(
            child=Field(resource=child, name=child_field),
            name=name_from_field(child_field),
            parent=Field(resource=parent, name=parent_field),
            cardinality=child_cardinality,
        )
    )

    if parent == "party":
        return rels
    # Reverse relationship
    rels.append(
        Relationship(
            child=Field(resource=parent, name=parent_field),
            name=name_inverse(child, parent),
            parent=Field(resource=child, name=child_field),
            cardinality=parent_cardinality,
        )
    )
    return rels


def name_from_field(child_field_name):
    """
    Derive the name of the embed field name.
    """
    if child_field_name.endswith("_id"):
        return child_field_name[:-3]
    return child_field_name


def name_inverse(child, parent):
    """
    Derive the name of the embed field name.
    """
    prefix = parent + "_"
    if child.startswith(prefix):
        return child[len(prefix) :]
    return child


def collect(resources) -> list[Relationship]:
    """
    Collect all FK relationships that have a cardinality annotation.
    Returns a list of dicts with the relationship metadata needed for the template.
    """
    rels = []
    for resource in resources:
        child = resource["id"]
        props = resource.get("properties", {})
        for field, attr in props.items():
            if not field.endswith("_id"):
                continue
            if not isinstance(attr, dict):
                continue
            fk = attr.get("x-foreign-key")
            if not fk or "cardinality" not in fk:
                continue
            child_field = field
            parent = fk["resource"]
            parent_field = fk["field"]
            cardinality = fk["cardinality"]
            rels.extend(
                from_foreign_key(child, child_field, parent, parent_field, cardinality)
            )
    return rels
