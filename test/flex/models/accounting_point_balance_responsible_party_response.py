from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.accounting_point_balance_responsible_party_energy_direction import (
    AccountingPointBalanceResponsiblePartyEnergyDirection,
)
from ..types import UNSET, Unset

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
    """

    accounting_point_id: int
    balance_responsible_party_id: int
    energy_direction: AccountingPointBalanceResponsiblePartyEnergyDirection
    valid_from: datetime.datetime
    valid_to: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id")

        balance_responsible_party_id = d.pop("balance_responsible_party_id")

        energy_direction = AccountingPointBalanceResponsiblePartyEnergyDirection(d.pop("energy_direction"))

        valid_from = isoparse(d.pop("valid_from"))

        def _parse_valid_to(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_to_type_0 = isoparse(data)

                return valid_to_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        accounting_point_balance_responsible_party_response = cls(
            accounting_point_id=accounting_point_id,
            balance_responsible_party_id=balance_responsible_party_id,
            energy_direction=energy_direction,
            valid_from=valid_from,
            valid_to=valid_to,
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
