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
    hidden: bool = False
    history: bool = False


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

    # We generally don't want lots of embeds on the party resource.
    # Lots of stuff in the system is pointing at it.
    hidden = False
    if parent == "party":
        # Some exceptions.
        # When we add these we don't want them to show up in the OpenAPI spec.
        if child not in ("party_membership", "system_operator_product_type"):
            return rels
        hidden = True

    # Reverse relationship
    rels.append(
        Relationship(
            child=Field(resource=parent, name=parent_field),
            name=name_inverse(child, parent),
            parent=Field(resource=child, name=child_field),
            cardinality=parent_cardinality,
            hidden=hidden,
        )
    )
    return rels


# map a field of a resource into the equivalent field of its history view
# (a reference to id becomes a reference to <resource>_id in the history view)
def history_field(field: Field) -> Field:
    return Field(
        resource=field.resource + "_history",
        name=(field.resource + "_id" if field.name == "id" else field.name),
    )


# derive the history variants of a relationship
# (history -> history)
def history_variants(
    rel: Relationship, history_resources: set[str]
) -> List[Relationship]:
    child_has_history = rel.child.resource in history_resources
    parent_has_history = rel.parent.resource in history_resources

    rels = []

    if child_has_history and parent_has_history:
        # history -> history
        rels.append(
            Relationship(
                child=history_field(rel.child),
                name=rel.name + "_history",
                parent=history_field(rel.parent),
                cardinality="many",
                hidden=rel.hidden,
                history=True,
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


def collect(resources, module="api") -> list[Relationship]:
    """
    Collect all FK relationships that have a cardinality annotation.
    Returns a list of dicts with the relationship metadata needed for the template.

    Deduplicates reverse relationships (multiple FKs to the same parent yield
    the same reverse name several times, we only keep the first one).
    """
    rels = []
    seen_reverse: set[tuple[str, str]] = set()  # (child_resource, embed_name)
    history_resources = {r["id"] for r in resources if r.get("history")}
    for resource in resources:
        child = resource["id"]
        if resource.get("module") != module:
            continue
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
            new_rels = from_foreign_key(
                child, child_field, parent, parent_field, cardinality
            )
            for rel in new_rels:
                key = (rel.child.resource, rel.name)
                if key in seen_reverse and rel.child.resource != child:
                    # duplicate reverse relationship: skip it
                    continue
                seen_reverse.add(key)
                rels.append(rel)

                for hrel in history_variants(rel, history_resources):
                    hkey = (hrel.child.resource, hrel.name)
                    if hkey in seen_reverse:
                        continue
                    seen_reverse.add(hkey)
                    rels.append(hrel)
    return rels
