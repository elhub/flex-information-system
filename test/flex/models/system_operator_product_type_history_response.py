from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.system_operator_product_type_status import SystemOperatorProductTypeStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_response import PartyResponse
    from ..models.product_type_response import ProductTypeResponse


T = TypeVar("T", bound="SystemOperatorProductTypeHistoryResponse")


@_attrs_define
class SystemOperatorProductTypeHistoryResponse:
    """System Operator Product Type - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        system_operator_id (int): Reference to the system operator. Example: 37.
        product_type_id (int): Reference to the product type. Example: 8.
        status (SystemOperatorProductTypeStatus): The status of the relation. Example: active.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        system_operator_product_type_id (int): Reference to the resource that was updated. Example: 48.
        system_operator (None | PartyResponse | Unset): Embedded party
        product_type (None | ProductTypeResponse | Unset): Embedded product_type
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    system_operator_id: int
    product_type_id: int
    status: SystemOperatorProductTypeStatus
    recorded_at: datetime.datetime
    recorded_by: int
    system_operator_product_type_id: int
    system_operator: None | PartyResponse | Unset = UNSET
    product_type: None | ProductTypeResponse | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
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

        system_operator_product_type_id = self.system_operator_product_type_id

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

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        elif isinstance(self.replaced_at, datetime.datetime):
            replaced_at = self.replaced_at.isoformat()
        else:
            replaced_at = self.replaced_at

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
                "system_operator_product_type_id": system_operator_product_type_id,
            }
        )
        if system_operator is not UNSET:
            field_dict["system_operator"] = system_operator
        if product_type is not UNSET:
            field_dict["product_type"] = product_type
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

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

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        system_operator_product_type_id = d.pop("system_operator_product_type_id")

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

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                replaced_at_type_0 = isoparse(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        system_operator_product_type_history_response = cls(
            id=id,
            system_operator_id=system_operator_id,
            product_type_id=product_type_id,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            system_operator_product_type_id=system_operator_product_type_id,
            system_operator=system_operator,
            product_type=product_type,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        system_operator_product_type_history_response.additional_properties = d
        return system_operator_product_type_history_response

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
