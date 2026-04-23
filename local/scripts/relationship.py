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
            name=name_from_field(child_field, parent),
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


def name_from_field(child_field_name, parent_resource=None):
    """
    Derive the name of the embed field name.
    """
    if child_field_name.endswith("_id"):
        return child_field_name[:-3]
    if child_field_name == "id" and parent_resource:
        return parent_resource
    return child_field_name


def name_inverse(child, parent):
    """
    Derive the name of the embed field name.
    """
    prefix = parent + "_"
    if child.startswith(prefix):
        return child[len(prefix) :]
    return child
