from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_balance_responsible_party_energy_direction import (
    AccountingPointBalanceResponsiblePartyEnergyDirection,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointBalanceResponsiblePartyCreateRequest")


@_attrs_define
class AccountingPointBalanceResponsiblePartyCreateRequest:
    """Request schema for create operations - Relation linking a balance responsible party to an accounting point.

    Attributes:
        energy_direction (Union[Unset, AccountingPointBalanceResponsiblePartyEnergyDirection]): The direction of the
            effect on the balance that the BRP takes responsibility for. Example: consumption.
    """

    energy_direction: Union[Unset, AccountingPointBalanceResponsiblePartyEnergyDirection] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        energy_direction: Union[Unset, str] = UNSET
        if not isinstance(self.energy_direction, Unset):
            energy_direction = self.energy_direction.value

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if energy_direction is not UNSET:
            field_dict["energy_direction"] = energy_direction

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _energy_direction = d.pop("energy_direction", UNSET)
        energy_direction: Union[Unset, AccountingPointBalanceResponsiblePartyEnergyDirection]
        if isinstance(_energy_direction, Unset):
            energy_direction = UNSET
        else:
            energy_direction = AccountingPointBalanceResponsiblePartyEnergyDirection(_energy_direction)

        accounting_point_balance_responsible_party_create_request = cls(
            energy_direction=energy_direction,
        )

        accounting_point_balance_responsible_party_create_request.additional_properties = d
        return accounting_point_balance_responsible_party_create_request

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
