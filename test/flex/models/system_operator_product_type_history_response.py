from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.system_operator_product_type_status import SystemOperatorProductTypeStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_history_response import PartyHistoryResponse


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
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
        system_operator_history (list[PartyHistoryResponse] | None | Unset): Embedded party_history
    """

    id: int
    system_operator_id: int
    product_type_id: int
    status: SystemOperatorProductTypeStatus
    recorded_at: datetime.datetime
    recorded_by: int
    system_operator_product_type_id: int
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    system_operator_history: list[PartyHistoryResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        system_operator_id = self.system_operator_id

        product_type_id = self.product_type_id

        status = self.status.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        system_operator_product_type_id = self.system_operator_product_type_id

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

        system_operator_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.system_operator_history, Unset):
            system_operator_history = UNSET
        elif isinstance(self.system_operator_history, list):
            system_operator_history = []
            for system_operator_history_type_0_item_data in self.system_operator_history:
                system_operator_history_type_0_item = system_operator_history_type_0_item_data.to_dict()
                system_operator_history.append(system_operator_history_type_0_item)

        else:
            system_operator_history = self.system_operator_history

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
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at
        if system_operator_history is not UNSET:
            field_dict["system_operator_history"] = system_operator_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_history_response import PartyHistoryResponse

        d = dict(src_dict)
        id = d.pop("id")

        system_operator_id = d.pop("system_operator_id")

        product_type_id = d.pop("product_type_id")

        status = SystemOperatorProductTypeStatus(d.pop("status"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        system_operator_product_type_id = d.pop("system_operator_product_type_id")

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
                replaced_at_type_0 = datetime.datetime.fromisoformat(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        def _parse_system_operator_history(data: object) -> list[PartyHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                system_operator_history_type_0 = []
                _system_operator_history_type_0 = data
                for system_operator_history_type_0_item_data in _system_operator_history_type_0:
                    system_operator_history_type_0_item = PartyHistoryResponse.from_dict(
                        system_operator_history_type_0_item_data
                    )

                    system_operator_history_type_0.append(system_operator_history_type_0_item)

                return system_operator_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[PartyHistoryResponse] | None | Unset, data)

        system_operator_history = _parse_system_operator_history(d.pop("system_operator_history", UNSET))

        system_operator_product_type_history_response = cls(
            id=id,
            system_operator_id=system_operator_id,
            product_type_id=product_type_id,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            system_operator_product_type_id=system_operator_product_type_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
            system_operator_history=system_operator_history,
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
