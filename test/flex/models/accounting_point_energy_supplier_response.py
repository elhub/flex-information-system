from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_response import AccountingPointResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="AccountingPointEnergySupplierResponse")


@_attrs_define
class AccountingPointEnergySupplierResponse:
    """Response schema - Relation linking an energy supplier to an accounting point.

    Attributes:
        accounting_point_id (int): The ID of the accounting point. Example: 45.
        energy_supplier_id (int): The energy supplier of the accounting point. Example: 7.
        valid_from (datetime.datetime): The date from which the relation between the accounting point and the energy
            supplier is valid. Midnight aligned on Norwegian timezone. Example: 2023-09-09T00:00:00+02.
        valid_to (datetime.datetime | None | Unset): The date until which the relation between the accounting point and
            the energy supplier is valid. Midnight aligned on Norwegian timezone.
        accounting_point (AccountingPointResponse | None | Unset): Embedded accounting_point
        energy_supplier (None | PartyResponse | Unset): Embedded party
    """

    accounting_point_id: int
    energy_supplier_id: int
    valid_from: datetime.datetime
    valid_to: datetime.datetime | None | Unset = UNSET
    accounting_point: AccountingPointResponse | None | Unset = UNSET
    energy_supplier: None | PartyResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.party_response import PartyResponse

        accounting_point_id = self.accounting_point_id

        energy_supplier_id = self.energy_supplier_id

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

        energy_supplier: dict[str, Any] | None | Unset
        if isinstance(self.energy_supplier, Unset):
            energy_supplier = UNSET
        elif isinstance(self.energy_supplier, PartyResponse):
            energy_supplier = self.energy_supplier.to_dict()
        else:
            energy_supplier = self.energy_supplier

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
        if accounting_point is not UNSET:
            field_dict["accounting_point"] = accounting_point
        if energy_supplier is not UNSET:
            field_dict["energy_supplier"] = energy_supplier

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id")

        energy_supplier_id = d.pop("energy_supplier_id")

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

        def _parse_energy_supplier(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                energy_supplier_type_0 = PartyResponse.from_dict(data)

                return energy_supplier_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        energy_supplier = _parse_energy_supplier(d.pop("energy_supplier", UNSET))

        accounting_point_energy_supplier_response = cls(
            accounting_point_id=accounting_point_id,
            energy_supplier_id=energy_supplier_id,
            valid_from=valid_from,
            valid_to=valid_to,
            accounting_point=accounting_point,
            energy_supplier=energy_supplier,
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
