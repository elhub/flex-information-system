from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeDataProductTypeNotQualified")


@_attrs_define
class NoticeDataProductTypeNotQualified:
    """Format of the data field in a notice of type
    no.elhub.flex.service_provider_product_suspension.product_type.not_qualified

        Attributes:
            product_type_ids (Union[Unset, List[int]]): List of product types that are not qualified.
    """

    product_type_ids: Union[Unset, List[int]] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        product_type_ids: Union[Unset, List[int]] = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        product_type_ids = cast(List[int], d.pop("product_type_ids", UNSET))

        notice_data_product_type_not_qualified = cls(
            product_type_ids=product_type_ids,
        )

        notice_data_product_type_not_qualified.additional_properties = d
        return notice_data_product_type_not_qualified

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
