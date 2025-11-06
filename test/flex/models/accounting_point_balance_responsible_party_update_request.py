from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_balance_responsible_party_energy_direction import (
    AccountingPointBalanceResponsiblePartyEnergyDirection,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointBalanceResponsiblePartyUpdateRequest")


@_attrs_define
class AccountingPointBalanceResponsiblePartyUpdateRequest:
    """Request schema for update operations - Relation linking a balance responsible party to an accounting point.

    Attributes:
        energy_direction (AccountingPointBalanceResponsiblePartyEnergyDirection | Unset): The direction of the effect on
            the balance that the BRP takes responsibility for. Example: consumption.
    """

    energy_direction: AccountingPointBalanceResponsiblePartyEnergyDirection | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        energy_direction: str | Unset = UNSET
        if not isinstance(self.energy_direction, Unset):
            energy_direction = self.energy_direction.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if energy_direction is not UNSET:
            field_dict["energy_direction"] = energy_direction

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _energy_direction = d.pop("energy_direction", UNSET)
        energy_direction: AccountingPointBalanceResponsiblePartyEnergyDirection | Unset
        if isinstance(_energy_direction, Unset):
            energy_direction = UNSET
        else:
            energy_direction = AccountingPointBalanceResponsiblePartyEnergyDirection(_energy_direction)

        accounting_point_balance_responsible_party_update_request = cls(
            energy_direction=energy_direction,
        )

        accounting_point_balance_responsible_party_update_request.additional_properties = d
        return accounting_point_balance_responsible_party_update_request

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
