import datetime
from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

T = TypeVar("T", bound="TimelineMultiRangeItem")


@_attrs_define
class TimelineMultiRangeItem:
    """
    Attributes:
        valid_from (Union[Unset, datetime.datetime]): The start time of the timeline section. Example:
            2023-01-01T00:00:00Z.
        valid_to (Union[Unset, datetime.datetime]): The end time of the timeline section. Example: 2023-01-02T00:00:00Z.
    """

    valid_from: Union[Unset, datetime.datetime] = UNSET
    valid_to: Union[Unset, datetime.datetime] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        valid_from: Union[Unset, str] = UNSET
        if not isinstance(self.valid_from, Unset):
            valid_from = self.valid_from.isoformat()

        valid_to: Union[Unset, str] = UNSET
        if not isinstance(self.valid_to, Unset):
            valid_to = self.valid_to.isoformat()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _valid_from = d.pop("valid_from", UNSET)
        valid_from: Union[Unset, datetime.datetime]
        if isinstance(_valid_from, Unset):
            valid_from = UNSET
        else:
            valid_from = isoparse(_valid_from)

        _valid_to = d.pop("valid_to", UNSET)
        valid_to: Union[Unset, datetime.datetime]
        if isinstance(_valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = isoparse(_valid_to)

        timeline_multi_range_item = cls(
            valid_from=valid_from,
            valid_to=valid_to,
        )

        timeline_multi_range_item.additional_properties = d
        return timeline_multi_range_item

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
