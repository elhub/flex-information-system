from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NotificationCreateData")


@_attrs_define
class NotificationCreateData:
    """Data of the request schema for create operations - Notification about an event happening in the system.

    Attributes:
        acknowledged (Union[Unset, bool]): Whether the notification was acknowledged by the target user.
        event_id (Union[Unset, int]): Reference to the event notified by this resource. Example: 37.
        party_id (Union[Unset, int]): Reference to the party concerned by this notification. Example: 37.
    """

    acknowledged: Union[Unset, bool] = UNSET
    event_id: Union[Unset, int] = UNSET
    party_id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        acknowledged = self.acknowledged

        event_id = self.event_id

        party_id = self.party_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if acknowledged is not UNSET:
            field_dict["acknowledged"] = acknowledged
        if event_id is not UNSET:
            field_dict["event_id"] = event_id
        if party_id is not UNSET:
            field_dict["party_id"] = party_id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        acknowledged = d.pop("acknowledged", UNSET)

        event_id = d.pop("event_id", UNSET)

        party_id = d.pop("party_id", UNSET)

        notification_create_data = cls(
            acknowledged=acknowledged,
            event_id=event_id,
            party_id=party_id,
        )

        notification_create_data.additional_properties = d
        return notification_create_data

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
