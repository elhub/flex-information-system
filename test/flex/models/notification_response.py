from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.event_response import EventResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="NotificationResponse")


@_attrs_define
class NotificationResponse:
    """Response schema - Notification about an event happening in the system.

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        acknowledged (bool): Whether the notification was acknowledged by the target user.
        event_id (int): Reference to the event notified by this resource. Example: 37.
        party_id (int): Reference to the party concerned by this notification. Example: 37.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        event (EventResponse | None | Unset): Embedded event
        party (None | PartyResponse | Unset): Embedded party
    """

    id: int
    acknowledged: bool
    event_id: int
    party_id: int
    recorded_at: datetime.datetime
    recorded_by: int
    event: EventResponse | None | Unset = UNSET
    party: None | PartyResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.event_response import EventResponse
        from ..models.party_response import PartyResponse

        id = self.id

        acknowledged = self.acknowledged

        event_id = self.event_id

        party_id = self.party_id

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        event: dict[str, Any] | None | Unset
        if isinstance(self.event, Unset):
            event = UNSET
        elif isinstance(self.event, EventResponse):
            event = self.event.to_dict()
        else:
            event = self.event

        party: dict[str, Any] | None | Unset
        if isinstance(self.party, Unset):
            party = UNSET
        elif isinstance(self.party, PartyResponse):
            party = self.party.to_dict()
        else:
            party = self.party

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
        if event is not UNSET:
            field_dict["event"] = event
        if party is not UNSET:
            field_dict["party"] = party

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.event_response import EventResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        id = d.pop("id")

        acknowledged = d.pop("acknowledged")

        event_id = d.pop("event_id")

        party_id = d.pop("party_id")

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_event(data: object) -> EventResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                event_type_0 = EventResponse.from_dict(data)

                return event_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(EventResponse | None | Unset, data)

        event = _parse_event(d.pop("event", UNSET))

        def _parse_party(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                party_type_0 = PartyResponse.from_dict(data)

                return party_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        party = _parse_party(d.pop("party", UNSET))

        notification_response = cls(
            id=id,
            acknowledged=acknowledged,
            event_id=event_id,
            party_id=party_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            event=event,
            party=party,
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
