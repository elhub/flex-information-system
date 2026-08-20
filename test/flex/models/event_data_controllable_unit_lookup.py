from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

T = TypeVar("T", bound="EventDataControllableUnitLookup")


@_attrs_define
class EventDataControllableUnitLookup:
    """Format of the data field in a controllable_unit.lookup event.

    Attributes:
        kind (Literal['event.data.controllable_unit.lookup']): Identifies the event data schema for discriminated union
            deserialization.
        requesting_party_id (int): The party that performed the controllable unit lookup. Example: 42.
    """

    kind: Literal["event.data.controllable_unit.lookup"]
    requesting_party_id: int

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        requesting_party_id = self.requesting_party_id

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "requesting_party_id": requesting_party_id,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["event.data.controllable_unit.lookup"], d.pop("kind"))
        if kind != "event.data.controllable_unit.lookup":
            raise ValueError(f"kind must match const 'event.data.controllable_unit.lookup', got '{kind}'")

        requesting_party_id = d.pop("requesting_party_id")

        event_data_controllable_unit_lookup = cls(
            kind=kind,
            requesting_party_id=requesting_party_id,
        )

        return event_data_controllable_unit_lookup
