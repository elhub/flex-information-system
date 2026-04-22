from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.system_operator_product_type_response import SystemOperatorProductTypeResponse


T = TypeVar("T", bound="ProductTypeResponse")


@_attrs_define
class ProductTypeResponse:
    """Response schema - Product type.

    Attributes:
        id (int): Unique surrogate identifier. Example: 4.
        business_id (str): The code for this product type. Example: manual_congestion.
        name (str): The name of the product type. Example: Manual Congestion.
        service (str): The service offered by the product type. Example: congestion management.
        products (str): Examples of products belonging to this product type. Example: LongFlex, ShortFlex.
        system_operator_product_type (None | SystemOperatorProductTypeResponse | Unset): Embedded
            system_operator_product_type
    """

    id: int
    business_id: str
    name: str
    service: str
    products: str
    system_operator_product_type: None | SystemOperatorProductTypeResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.system_operator_product_type_response import SystemOperatorProductTypeResponse

        id = self.id

        business_id = self.business_id

        name = self.name

        service = self.service

        products = self.products

        system_operator_product_type: dict[str, Any] | None | Unset
        if isinstance(self.system_operator_product_type, Unset):
            system_operator_product_type = UNSET
        elif isinstance(self.system_operator_product_type, SystemOperatorProductTypeResponse):
            system_operator_product_type = self.system_operator_product_type.to_dict()
        else:
            system_operator_product_type = self.system_operator_product_type

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "name": name,
                "service": service,
                "products": products,
            }
        )
        if system_operator_product_type is not UNSET:
            field_dict["system_operator_product_type"] = system_operator_product_type

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.system_operator_product_type_response import SystemOperatorProductTypeResponse

        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        name = d.pop("name")

        service = d.pop("service")

        products = d.pop("products")

        def _parse_system_operator_product_type(data: object) -> None | SystemOperatorProductTypeResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                system_operator_product_type_type_0 = SystemOperatorProductTypeResponse.from_dict(data)

                return system_operator_product_type_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | SystemOperatorProductTypeResponse | Unset, data)

        system_operator_product_type = _parse_system_operator_product_type(d.pop("system_operator_product_type", UNSET))

        product_type_response = cls(
            id=id,
            business_id=business_id,
            name=name,
            service=service,
            products=products,
            system_operator_product_type=system_operator_product_type,
        )

        product_type_response.additional_properties = d
        return product_type_response

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
