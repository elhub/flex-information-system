from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_balance_responsible_party_energy_direction import (
    AccountingPointBalanceResponsiblePartyEnergyDirection,
)
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_response import AccountingPointResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="AccountingPointBalanceResponsiblePartyResponse")


@_attrs_define
class AccountingPointBalanceResponsiblePartyResponse:
    """Response schema - Relation linking a balance responsible party to an accounting point.

    Attributes:
        accounting_point_id (int): The ID of the accounting point. Example: 245.
        balance_responsible_party_id (int): The balance responsible party of the accounting point. Example: 37.
        energy_direction (AccountingPointBalanceResponsiblePartyEnergyDirection): The direction of the effect on the
            balance that the BRP takes responsibility for. Example: consumption.
        valid_from (datetime.datetime): The date from which the relation between the accounting point and the balance
            responsible party is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08T00:00:00+02.
        valid_to (datetime.datetime | None | Unset): The date until which the relation between the accounting point and
            the balance responsible party is valid. Midnight aligned on Norwegian timezone.
        accounting_point (AccountingPointResponse | None | Unset): Embedded accounting_point
        balance_responsible_party (None | PartyResponse | Unset): Embedded party
    """

    accounting_point_id: int
    balance_responsible_party_id: int
    energy_direction: AccountingPointBalanceResponsiblePartyEnergyDirection
    valid_from: datetime.datetime
    valid_to: datetime.datetime | None | Unset = UNSET
    accounting_point: AccountingPointResponse | None | Unset = UNSET
    balance_responsible_party: None | PartyResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.party_response import PartyResponse

        accounting_point_id = self.accounting_point_id

        balance_responsible_party_id = self.balance_responsible_party_id

        energy_direction = self.energy_direction.value

        valid_from = self.valid_from.isoformat()

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        elif isinstance(self.valid_to, datetime.datetime):
            valid_to = self.valid_to.isoformat()
        else:
            valid_to = self.valid_to

        accounting_point: dict[str, Any] | None | Unset
        if isinstance(self.accounting_point, Unset):
            accounting_point = UNSET
        elif isinstance(self.accounting_point, AccountingPointResponse):
            accounting_point = self.accounting_point.to_dict()
        else:
            accounting_point = self.accounting_point

        balance_responsible_party: dict[str, Any] | None | Unset
        if isinstance(self.balance_responsible_party, Unset):
            balance_responsible_party = UNSET
        elif isinstance(self.balance_responsible_party, PartyResponse):
            balance_responsible_party = self.balance_responsible_party.to_dict()
        else:
            balance_responsible_party = self.balance_responsible_party

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "accounting_point_id": accounting_point_id,
                "balance_responsible_party_id": balance_responsible_party_id,
                "energy_direction": energy_direction,
                "valid_from": valid_from,
            }
        )
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if accounting_point is not UNSET:
            field_dict["accounting_point"] = accounting_point
        if balance_responsible_party is not UNSET:
            field_dict["balance_responsible_party"] = balance_responsible_party

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id")

        balance_responsible_party_id = d.pop("balance_responsible_party_id")

        energy_direction = AccountingPointBalanceResponsiblePartyEnergyDirection(d.pop("energy_direction"))

        valid_from = datetime.datetime.fromisoformat(d.pop("valid_from"))

        def _parse_valid_to(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_to_type_0 = datetime.datetime.fromisoformat(data)

                return valid_to_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        def _parse_accounting_point(data: object) -> AccountingPointResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                accounting_point_type_0 = AccountingPointResponse.from_dict(data)

                return accounting_point_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointResponse | None | Unset, data)

        accounting_point = _parse_accounting_point(d.pop("accounting_point", UNSET))

        def _parse_balance_responsible_party(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                balance_responsible_party_type_0 = PartyResponse.from_dict(data)

                return balance_responsible_party_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        balance_responsible_party = _parse_balance_responsible_party(d.pop("balance_responsible_party", UNSET))

        accounting_point_balance_responsible_party_response = cls(
            accounting_point_id=accounting_point_id,
            balance_responsible_party_id=balance_responsible_party_id,
            energy_direction=energy_direction,
            valid_from=valid_from,
            valid_to=valid_to,
            accounting_point=accounting_point,
            balance_responsible_party=balance_responsible_party,
        )

        accounting_point_balance_responsible_party_response.additional_properties = d
        return accounting_point_balance_responsible_party_response

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
