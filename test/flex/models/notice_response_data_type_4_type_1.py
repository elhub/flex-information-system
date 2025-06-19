from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.notice_response_data_type_4_type_1_missing_record import NoticeResponseDataType4Type1MissingRecord


T = TypeVar("T", bound="NoticeResponseDataType4Type1")


@_attrs_define
class NoticeResponseDataType4Type1:
    """
    Attributes:
        missing_record (Union[Unset, NoticeResponseDataType4Type1MissingRecord]): Data of the record missing in the
            database.
    """

    missing_record: Union[Unset, "NoticeResponseDataType4Type1MissingRecord"] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        missing_record: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.missing_record, Unset):
            missing_record = self.missing_record.to_dict()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if missing_record is not UNSET:
            field_dict["missing_record"] = missing_record

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.notice_response_data_type_4_type_1_missing_record import NoticeResponseDataType4Type1MissingRecord

        d = src_dict.copy()
        _missing_record = d.pop("missing_record", UNSET)
        missing_record: Union[Unset, NoticeResponseDataType4Type1MissingRecord]
        if isinstance(_missing_record, Unset):
            missing_record = UNSET
        else:
            missing_record = NoticeResponseDataType4Type1MissingRecord.from_dict(_missing_record)

        notice_response_data_type_4_type_1 = cls(
            missing_record=missing_record,
        )

        notice_response_data_type_4_type_1.additional_properties = d
        return notice_response_data_type_4_type_1

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
