from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointEnergySupplierResponse")


@_attrs_define
class AccountingPointEnergySupplierResponse:
    """Response schema - Relation linking an energy supplier to an accounting point.

    Attributes:
        accounting_point_id (int): The ID of the accounting point. Example: 45.
        energy_supplier_id (int): The energy supplier of the accounting point. Example: 7.
        valid_from (str): The date from which the relation between the accounting point and the energy supplier is
            valid. Midnight aligned on Norwegian timezone. Example: 2023-09-09 00:00:00 CET.
        valid_to (None | str | Unset): The date until which the relation between the accounting point and the energy
            supplier is valid. Midnight aligned on Norwegian timezone.
    """

    accounting_point_id: int
    energy_supplier_id: int
    valid_from: str
    valid_to: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        accounting_point_id = self.accounting_point_id

        energy_supplier_id = self.energy_supplier_id

        valid_from = self.valid_from

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "accounting_point_id": accounting_point_id,
                "energy_supplier_id": energy_supplier_id,
                "valid_from": valid_from,
            }
        )
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id")

        energy_supplier_id = d.pop("energy_supplier_id")

        valid_from = d.pop("valid_from")

        def _parse_valid_to(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        accounting_point_energy_supplier_response = cls(
            accounting_point_id=accounting_point_id,
            energy_supplier_id=energy_supplier_id,
            valid_from=valid_from,
            valid_to=valid_to,
        )

        accounting_point_energy_supplier_response.additional_properties = d
        return accounting_point_energy_supplier_response

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
