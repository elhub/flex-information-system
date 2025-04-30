from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_balance_responsible_party_direction import (
    AccountingPointBalanceResponsiblePartyDirection,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointBalanceResponsiblePartyUpdateRequest")


@_attrs_define
class AccountingPointBalanceResponsiblePartyUpdateRequest:
    """Request schema for update operations - Relation linking a balance responsible party to an accounting point.

    Attributes:
        direction (Union[Unset, AccountingPointBalanceResponsiblePartyDirection]): The direction of the effect on the
            balance that the BRP takes responsibility for. Example: consumption.
    """

    direction: Union[Unset, AccountingPointBalanceResponsiblePartyDirection] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        direction: Union[Unset, str] = UNSET
        if not isinstance(self.direction, Unset):
            direction = self.direction.value

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if direction is not UNSET:
            field_dict["direction"] = direction

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _direction = d.pop("direction", UNSET)
        direction: Union[Unset, AccountingPointBalanceResponsiblePartyDirection]
        if isinstance(_direction, Unset):
            direction = UNSET
        else:
            direction = AccountingPointBalanceResponsiblePartyDirection(_direction)

        accounting_point_balance_responsible_party_update_request = cls(
            direction=direction,
        )

        accounting_point_balance_responsible_party_update_request.additional_properties = d
        return accounting_point_balance_responsible_party_update_request

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
