from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeDataControllableUnitProductDuplication")


@_attrs_define
class NoticeDataControllableUnitProductDuplication:
    """Format of the data field in a notice with data.kind = notice.data.controllable_unit.product_duplication

    Attributes:
        kind (Literal['notice.data.controllable_unit.product_duplication']): Identifies the notice data schema for
            discriminated union deserialization.
        product_type_id (int | Unset): The product type for which the controllable unit is registered in multiple
            service providing groups with active applications. Example: 2.
        service_providing_group_ids (list[int] | Unset): The service providing groups the controllable unit is a member
            of that have active applications for the product type.
    """

    kind: Literal["notice.data.controllable_unit.product_duplication"]
    product_type_id: int | Unset = UNSET
    service_providing_group_ids: list[int] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        product_type_id = self.product_type_id

        service_providing_group_ids: list[int] | Unset = UNSET
        if not isinstance(self.service_providing_group_ids, Unset):
            service_providing_group_ids = self.service_providing_group_ids

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "kind": kind,
            }
        )
        if product_type_id is not UNSET:
            field_dict["product_type_id"] = product_type_id
        if service_providing_group_ids is not UNSET:
            field_dict["service_providing_group_ids"] = service_providing_group_ids

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["notice.data.controllable_unit.product_duplication"], d.pop("kind"))
        if kind != "notice.data.controllable_unit.product_duplication":
            raise ValueError(f"kind must match const 'notice.data.controllable_unit.product_duplication', got '{kind}'")

        product_type_id = d.pop("product_type_id", UNSET)

        service_providing_group_ids = cast(list[int], d.pop("service_providing_group_ids", UNSET))

        notice_data_controllable_unit_product_duplication = cls(
            kind=kind,
            product_type_id=product_type_id,
            service_providing_group_ids=service_providing_group_ids,
        )

        notice_data_controllable_unit_product_duplication.additional_properties = d
        return notice_data_controllable_unit_product_duplication

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
