from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ProductType")


@_attrs_define
class ProductType:
    """Data schema - Product type.

    Attributes:
        id (int | Unset): Unique surrogate identifier. Example: 4.
        business_id (str | Unset): The code for this product type. Example: manual_congestion.
        name (str | Unset): The name of the product type. Example: Manual Congestion.
        service (str | Unset): The service offered by the product type. Example: congestion management.
        products (str | Unset): Examples of products belonging to this product type. Example: LongFlex, ShortFlex.
    """

    id: int | Unset = UNSET
    business_id: str | Unset = UNSET
    name: str | Unset = UNSET
    service: str | Unset = UNSET
    products: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        name = self.name

        service = self.service

        products = self.products

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if name is not UNSET:
            field_dict["name"] = name
        if service is not UNSET:
            field_dict["service"] = service
        if products is not UNSET:
            field_dict["products"] = products

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id", UNSET)

        business_id = d.pop("business_id", UNSET)

        name = d.pop("name", UNSET)

        service = d.pop("service", UNSET)

        products = d.pop("products", UNSET)

        product_type = cls(
            id=id,
            business_id=business_id,
            name=name,
            service=service,
            products=products,
        )

        product_type.additional_properties = d
        return product_type

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
