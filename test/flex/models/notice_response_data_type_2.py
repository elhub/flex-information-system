from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.notice_response_data_type_2_updated_fields import NoticeResponseDataType2UpdatedFields


T = TypeVar("T", bound="NoticeResponseDataType2")


@_attrs_define
class NoticeResponseDataType2:
    """
    Attributes:
        updated_fields (Union[Unset, NoticeResponseDataType2UpdatedFields]): Values of fields that have been updated in
            a later version of the resource.
    """

    updated_fields: Union[Unset, "NoticeResponseDataType2UpdatedFields"] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        updated_fields: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.updated_fields, Unset):
            updated_fields = self.updated_fields.to_dict()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if updated_fields is not UNSET:
            field_dict["updated_fields"] = updated_fields

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.notice_response_data_type_2_updated_fields import NoticeResponseDataType2UpdatedFields

        d = src_dict.copy()
        _updated_fields = d.pop("updated_fields", UNSET)
        updated_fields: Union[Unset, NoticeResponseDataType2UpdatedFields]
        if isinstance(_updated_fields, Unset):
            updated_fields = UNSET
        else:
            updated_fields = NoticeResponseDataType2UpdatedFields.from_dict(_updated_fields)

        notice_response_data_type_2 = cls(
            updated_fields=updated_fields,
        )

        notice_response_data_type_2.additional_properties = d
        return notice_response_data_type_2

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
