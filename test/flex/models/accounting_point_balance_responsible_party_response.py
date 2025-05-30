from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_balance_responsible_party_energy_direction import (
    AccountingPointBalanceResponsiblePartyEnergyDirection,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointBalanceResponsiblePartyResponse")


@_attrs_define
class AccountingPointBalanceResponsiblePartyResponse:
    """Response schema for operations with return values - Relation linking a balance responsible party to an accounting
    point.

        Attributes:
            energy_direction (Union[Unset, AccountingPointBalanceResponsiblePartyEnergyDirection]): The direction of the
                effect on the balance that the BRP takes responsibility for. Example: consumption.
            accounting_point_id (Union[Unset, int]): The ID of the accounting point. Example: 245.
            balance_responsible_party_id (Union[Unset, int]): The balance responsible party of the accounting point.
                Example: 37.
            valid_from (Union[Unset, str]): The date from which the relation between the accounting point and the balance
                responsible party is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
            valid_to (Union[None, Unset, str]): The date until which the relation between the accounting point and the
                balance responsible party is valid. Midnight aligned on Norwegian timezone.
    """

    energy_direction: Union[Unset, AccountingPointBalanceResponsiblePartyEnergyDirection] = UNSET
    accounting_point_id: Union[Unset, int] = UNSET
    balance_responsible_party_id: Union[Unset, int] = UNSET
    valid_from: Union[Unset, str] = UNSET
    valid_to: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        energy_direction: Union[Unset, str] = UNSET
        if not isinstance(self.energy_direction, Unset):
            energy_direction = self.energy_direction.value

        accounting_point_id = self.accounting_point_id

        balance_responsible_party_id = self.balance_responsible_party_id

        valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if energy_direction is not UNSET:
            field_dict["energy_direction"] = energy_direction
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id
        if balance_responsible_party_id is not UNSET:
            field_dict["balance_responsible_party_id"] = balance_responsible_party_id
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

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

        accounting_point_id = d.pop("accounting_point_id", UNSET)

        balance_responsible_party_id = d.pop("balance_responsible_party_id", UNSET)

        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        accounting_point_balance_responsible_party_response = cls(
            energy_direction=energy_direction,
            accounting_point_id=accounting_point_id,
            balance_responsible_party_id=balance_responsible_party_id,
            valid_from=valid_from,
            valid_to=valid_to,
        )

        accounting_point_balance_responsible_party_response.additional_properties = d
        return accounting_point_balance_responsible_party_response

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
