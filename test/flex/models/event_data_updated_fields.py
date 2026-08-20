from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

T = TypeVar("T", bound="EventDataUpdatedFields")


@_attrs_define
class EventDataUpdatedFields:
    """Common format of the data field in events concerning update operations.

    Attributes:
        kind (Literal['event.data.updated_fields']): Identifies the event data schema for discriminated union
            deserialization.
        updated_fields (list[str]): Names of the fields that were modified by the update. Example: ['status',
            'valid_from'].
    """

    kind: Literal["event.data.updated_fields"]
    updated_fields: list[str]

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        updated_fields = self.updated_fields

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "updated_fields": updated_fields,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["event.data.updated_fields"], d.pop("kind"))
        if kind != "event.data.updated_fields":
            raise ValueError(f"kind must match const 'event.data.updated_fields', got '{kind}'")

        updated_fields = cast(list[str], d.pop("updated_fields"))

        event_data_updated_fields = cls(
            kind=kind,
            updated_fields=updated_fields,
        )

        return event_data_updated_fields
