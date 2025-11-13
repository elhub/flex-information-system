from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.timeline_multi_range_item import TimelineMultiRangeItem


T = TypeVar("T", bound="NoticeDataValidTimeOutsideContract")


@_attrs_define
class NoticeDataValidTimeOutsideContract:
    """Format of the data field in a notice of type no.elhub.flex.*.valid_time.outside_contract

    Attributes:
        invalid_timeline (list[TimelineMultiRangeItem] | Unset): Partial timeline data that is relevant to mention, in a
            notice for instance. Multirange format, i.e., array of start/end timestamp pairs.
    """

    invalid_timeline: list[TimelineMultiRangeItem] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        invalid_timeline: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.invalid_timeline, Unset):
            invalid_timeline = []
            for componentsschemastimeline_multi_range_item_data in self.invalid_timeline:
                componentsschemastimeline_multi_range_item = componentsschemastimeline_multi_range_item_data.to_dict()
                invalid_timeline.append(componentsschemastimeline_multi_range_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if invalid_timeline is not UNSET:
            field_dict["invalid_timeline"] = invalid_timeline

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.timeline_multi_range_item import TimelineMultiRangeItem

        d = dict(src_dict)
        _invalid_timeline = d.pop("invalid_timeline", UNSET)
        invalid_timeline: list[TimelineMultiRangeItem] | Unset = UNSET
        if _invalid_timeline is not UNSET:
            invalid_timeline = []
            for componentsschemastimeline_multi_range_item_data in _invalid_timeline:
                componentsschemastimeline_multi_range_item = TimelineMultiRangeItem.from_dict(
                    componentsschemastimeline_multi_range_item_data
                )

                invalid_timeline.append(componentsschemastimeline_multi_range_item)

        notice_data_valid_time_outside_contract = cls(
            invalid_timeline=invalid_timeline,
        )

        notice_data_valid_time_outside_contract.additional_properties = d
        return notice_data_valid_time_outside_contract

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
