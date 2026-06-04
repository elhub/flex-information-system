from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.system_operator_product_type_status import SystemOperatorProductTypeStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_response import PartyResponse
    from ..models.product_type_response import ProductTypeResponse


T = TypeVar("T", bound="SystemOperatorProductTypeResponse")


@_attrs_define
class SystemOperatorProductTypeResponse:
    """Response schema - Relation between a system operator and a product type they want to buy.

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        system_operator_id (int): Reference to the system operator. Example: 37.
        product_type_id (int): Reference to the product type. Example: 8.
        status (SystemOperatorProductTypeStatus): The status of the relation. Example: active.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        system_operator (None | PartyResponse | Unset): Embedded party
        product_type (None | ProductTypeResponse | Unset): Embedded product_type
    """

    id: int
    system_operator_id: int
    product_type_id: int
    status: SystemOperatorProductTypeStatus
    recorded_at: datetime.datetime
    recorded_by: int
    system_operator: None | PartyResponse | Unset = UNSET
    product_type: None | ProductTypeResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.party_response import PartyResponse
        from ..models.product_type_response import ProductTypeResponse

        id = self.id

        system_operator_id = self.system_operator_id

        product_type_id = self.product_type_id

        status = self.status.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        system_operator: dict[str, Any] | None | Unset
        if isinstance(self.system_operator, Unset):
            system_operator = UNSET
        elif isinstance(self.system_operator, PartyResponse):
            system_operator = self.system_operator.to_dict()
        else:
            system_operator = self.system_operator

        product_type: dict[str, Any] | None | Unset
        if isinstance(self.product_type, Unset):
            product_type = UNSET
        elif isinstance(self.product_type, ProductTypeResponse):
            product_type = self.product_type.to_dict()
        else:
            product_type = self.product_type

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "system_operator_id": system_operator_id,
                "product_type_id": product_type_id,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if system_operator is not UNSET:
            field_dict["system_operator"] = system_operator
        if product_type is not UNSET:
            field_dict["product_type"] = product_type

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_response import PartyResponse
        from ..models.product_type_response import ProductTypeResponse

        d = dict(src_dict)
        id = d.pop("id")

        system_operator_id = d.pop("system_operator_id")

        product_type_id = d.pop("product_type_id")

        status = SystemOperatorProductTypeStatus(d.pop("status"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_system_operator(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                system_operator_type_0 = PartyResponse.from_dict(data)

                return system_operator_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        system_operator = _parse_system_operator(d.pop("system_operator", UNSET))

        def _parse_product_type(data: object) -> None | ProductTypeResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                product_type_type_0 = ProductTypeResponse.from_dict(data)

                return product_type_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ProductTypeResponse | Unset, data)

        product_type = _parse_product_type(d.pop("product_type", UNSET))

        system_operator_product_type_response = cls(
            id=id,
            system_operator_id=system_operator_id,
            product_type_id=product_type_id,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            system_operator=system_operator,
            product_type=product_type,
        )

        system_operator_product_type_response.additional_properties = d
        return system_operator_product_type_response

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
