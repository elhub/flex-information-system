from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.notice_data_product_type_not_qualified_notice_type import NoticeDataProductTypeNotQualifiedNoticeType
from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeDataProductTypeNotQualified")


@_attrs_define
class NoticeDataProductTypeNotQualified:
    """Format of the data field in a notice of type
    no.elhub.flex.service_provider_product_suspension.product_type.not_qualified

        Attributes:
            notice_type (NoticeDataProductTypeNotQualifiedNoticeType | Unset): Identifies the notice type for discriminated
                union deserialization.
            product_type_ids (list[int] | Unset): List of product types that are not qualified.
    """

    notice_type: NoticeDataProductTypeNotQualifiedNoticeType | Unset = UNSET
    product_type_ids: list[int] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        notice_type: str | Unset = UNSET
        if not isinstance(self.notice_type, Unset):
            notice_type = self.notice_type.value

        product_type_ids: list[int] | Unset = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if notice_type is not UNSET:
            field_dict["notice_type"] = notice_type
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _notice_type = d.pop("notice_type", UNSET)
        notice_type: NoticeDataProductTypeNotQualifiedNoticeType | Unset
        if isinstance(_notice_type, Unset):
            notice_type = UNSET
        else:
            notice_type = NoticeDataProductTypeNotQualifiedNoticeType(_notice_type)

        product_type_ids = cast(list[int], d.pop("product_type_ids", UNSET))

        notice_data_product_type_not_qualified = cls(
            notice_type=notice_type,
            product_type_ids=product_type_ids,
        )

        notice_data_product_type_not_qualified.additional_properties = d
        return notice_data_product_type_not_qualified

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
