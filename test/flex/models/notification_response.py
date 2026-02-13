from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="NotificationResponse")


@_attrs_define
class NotificationResponse:
    """Response schema - Notification about an event happening in the system.

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        acknowledged (bool): Whether the notification was acknowledged by the target user.
        event_id (int): Reference to the event notified by this resource. Example: 37.
        party_id (int): Reference to the party concerned by this notification. Example: 37.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00Z.
        recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    acknowledged: bool
    event_id: int
    party_id: int
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        acknowledged = self.acknowledged

        event_id = self.event_id

        party_id = self.party_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "acknowledged": acknowledged,
                "event_id": event_id,
                "party_id": party_id,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        acknowledged = d.pop("acknowledged")

        event_id = d.pop("event_id")

        party_id = d.pop("party_id")

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        notification_response = cls(
            id=id,
            acknowledged=acknowledged,
            event_id=event_id,
            party_id=party_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        notification_response.additional_properties = d
        return notification_response

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
