from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="Notification")


@_attrs_define
class Notification:
    """Data schema - Notification about an event happening in the system.

    Attributes:
        acknowledged (bool | Unset): Whether the notification was acknowledged by the target user.
        event_id (int | Unset): Reference to the event notified by this resource. Example: 37.
        party_id (int | Unset): Reference to the party concerned by this notification. Example: 37.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate identifier. Example: 89.
    """

    acknowledged: bool | Unset = UNSET
    event_id: int | Unset = UNSET
    party_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        acknowledged = self.acknowledged

        event_id = self.event_id

        party_id = self.party_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if acknowledged is not UNSET:
            field_dict["acknowledged"] = acknowledged
        if event_id is not UNSET:
            field_dict["event_id"] = event_id
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        acknowledged = d.pop("acknowledged", UNSET)

        event_id = d.pop("event_id", UNSET)

        party_id = d.pop("party_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        notification = cls(
            acknowledged=acknowledged,
            event_id=event_id,
            party_id=party_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        notification.additional_properties = d
        return notification

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
