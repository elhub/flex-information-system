from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeResponseDataType4Type0")


@_attrs_define
class NoticeResponseDataType4Type0:
    """
    Attributes:
        invalid_timeline (Union[Unset, str]): Section of the resource's valid time that is not covered by a required
            contract.
    """

    invalid_timeline: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        invalid_timeline = self.invalid_timeline

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if invalid_timeline is not UNSET:
            field_dict["invalid_timeline"] = invalid_timeline

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        invalid_timeline = d.pop("invalid_timeline", UNSET)

        notice_response_data_type_4_type_0 = cls(
            invalid_timeline=invalid_timeline,
        )

        notice_response_data_type_4_type_0.additional_properties = d
        return notice_response_data_type_4_type_0

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
