from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_balance_responsible_party_response import (
        AccountingPointBalanceResponsiblePartyResponse,
    )
    from ..models.accounting_point_bidding_zone_response import AccountingPointBiddingZoneResponse
    from ..models.accounting_point_end_user_response import AccountingPointEndUserResponse
    from ..models.accounting_point_energy_supplier_response import AccountingPointEnergySupplierResponse
    from ..models.accounting_point_metering_grid_area_response import AccountingPointMeteringGridAreaResponse
    from ..models.controllable_unit_response import ControllableUnitResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="AccountingPointResponse")


@_attrs_define
class AccountingPointResponse:
    """Response schema - Accounting point for a controllable unit.

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        business_id (str): The GSRN metering point id of the accounting point. Example: 709000000000000057.
        system_operator_id (int): The system operator of the accounting point.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        controllable_unit (ControllableUnitResponse | None | Unset): Embedded controllable_unit
        system_operator (None | PartyResponse | Unset): Embedded party
        balance_responsible_party (AccountingPointBalanceResponsiblePartyResponse | None | Unset): Embedded
            accounting_point_balance_responsible_party
        bidding_zone (AccountingPointBiddingZoneResponse | None | Unset): Embedded accounting_point_bidding_zone
        end_user (AccountingPointEndUserResponse | None | Unset): Embedded accounting_point_end_user
        energy_supplier (AccountingPointEnergySupplierResponse | None | Unset): Embedded
            accounting_point_energy_supplier
        metering_grid_area (AccountingPointMeteringGridAreaResponse | None | Unset): Embedded
            accounting_point_metering_grid_area
    """

    id: int
    business_id: str
    system_operator_id: int
    recorded_at: datetime.datetime
    recorded_by: int
    controllable_unit: ControllableUnitResponse | None | Unset = UNSET
    system_operator: None | PartyResponse | Unset = UNSET
    balance_responsible_party: AccountingPointBalanceResponsiblePartyResponse | None | Unset = UNSET
    bidding_zone: AccountingPointBiddingZoneResponse | None | Unset = UNSET
    end_user: AccountingPointEndUserResponse | None | Unset = UNSET
    energy_supplier: AccountingPointEnergySupplierResponse | None | Unset = UNSET
    metering_grid_area: AccountingPointMeteringGridAreaResponse | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_balance_responsible_party_response import (
            AccountingPointBalanceResponsiblePartyResponse,
        )
        from ..models.accounting_point_bidding_zone_response import AccountingPointBiddingZoneResponse
        from ..models.accounting_point_end_user_response import AccountingPointEndUserResponse
        from ..models.accounting_point_energy_supplier_response import AccountingPointEnergySupplierResponse
        from ..models.accounting_point_metering_grid_area_response import AccountingPointMeteringGridAreaResponse
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.party_response import PartyResponse

        id = self.id

        business_id = self.business_id

        system_operator_id = self.system_operator_id

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        controllable_unit: dict[str, Any] | None | Unset
        if isinstance(self.controllable_unit, Unset):
            controllable_unit = UNSET
        elif isinstance(self.controllable_unit, ControllableUnitResponse):
            controllable_unit = self.controllable_unit.to_dict()
        else:
            controllable_unit = self.controllable_unit

        system_operator: dict[str, Any] | None | Unset
        if isinstance(self.system_operator, Unset):
            system_operator = UNSET
        elif isinstance(self.system_operator, PartyResponse):
            system_operator = self.system_operator.to_dict()
        else:
            system_operator = self.system_operator

        balance_responsible_party: dict[str, Any] | None | Unset
        if isinstance(self.balance_responsible_party, Unset):
            balance_responsible_party = UNSET
        elif isinstance(self.balance_responsible_party, AccountingPointBalanceResponsiblePartyResponse):
            balance_responsible_party = self.balance_responsible_party.to_dict()
        else:
            balance_responsible_party = self.balance_responsible_party

        bidding_zone: dict[str, Any] | None | Unset
        if isinstance(self.bidding_zone, Unset):
            bidding_zone = UNSET
        elif isinstance(self.bidding_zone, AccountingPointBiddingZoneResponse):
            bidding_zone = self.bidding_zone.to_dict()
        else:
            bidding_zone = self.bidding_zone

        end_user: dict[str, Any] | None | Unset
        if isinstance(self.end_user, Unset):
            end_user = UNSET
        elif isinstance(self.end_user, AccountingPointEndUserResponse):
            end_user = self.end_user.to_dict()
        else:
            end_user = self.end_user

        energy_supplier: dict[str, Any] | None | Unset
        if isinstance(self.energy_supplier, Unset):
            energy_supplier = UNSET
        elif isinstance(self.energy_supplier, AccountingPointEnergySupplierResponse):
            energy_supplier = self.energy_supplier.to_dict()
        else:
            energy_supplier = self.energy_supplier

        metering_grid_area: dict[str, Any] | None | Unset
        if isinstance(self.metering_grid_area, Unset):
            metering_grid_area = UNSET
        elif isinstance(self.metering_grid_area, AccountingPointMeteringGridAreaResponse):
            metering_grid_area = self.metering_grid_area.to_dict()
        else:
            metering_grid_area = self.metering_grid_area

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "system_operator_id": system_operator_id,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if controllable_unit is not UNSET:
            field_dict["controllable_unit"] = controllable_unit
        if system_operator is not UNSET:
            field_dict["system_operator"] = system_operator
        if balance_responsible_party is not UNSET:
            field_dict["balance_responsible_party"] = balance_responsible_party
        if bidding_zone is not UNSET:
            field_dict["bidding_zone"] = bidding_zone
        if end_user is not UNSET:
            field_dict["end_user"] = end_user
        if energy_supplier is not UNSET:
            field_dict["energy_supplier"] = energy_supplier
        if metering_grid_area is not UNSET:
            field_dict["metering_grid_area"] = metering_grid_area

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_balance_responsible_party_response import (
            AccountingPointBalanceResponsiblePartyResponse,
        )
        from ..models.accounting_point_bidding_zone_response import AccountingPointBiddingZoneResponse
        from ..models.accounting_point_end_user_response import AccountingPointEndUserResponse
        from ..models.accounting_point_energy_supplier_response import AccountingPointEnergySupplierResponse
        from ..models.accounting_point_metering_grid_area_response import AccountingPointMeteringGridAreaResponse
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        system_operator_id = d.pop("system_operator_id")

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_controllable_unit(data: object) -> ControllableUnitResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                controllable_unit_type_0 = ControllableUnitResponse.from_dict(data)

                return controllable_unit_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ControllableUnitResponse | None | Unset, data)

        controllable_unit = _parse_controllable_unit(d.pop("controllable_unit", UNSET))

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

        def _parse_balance_responsible_party(
            data: object,
        ) -> AccountingPointBalanceResponsiblePartyResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                balance_responsible_party_type_0 = AccountingPointBalanceResponsiblePartyResponse.from_dict(data)

                return balance_responsible_party_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointBalanceResponsiblePartyResponse | None | Unset, data)

        balance_responsible_party = _parse_balance_responsible_party(d.pop("balance_responsible_party", UNSET))

        def _parse_bidding_zone(data: object) -> AccountingPointBiddingZoneResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                bidding_zone_type_0 = AccountingPointBiddingZoneResponse.from_dict(data)

                return bidding_zone_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointBiddingZoneResponse | None | Unset, data)

        bidding_zone = _parse_bidding_zone(d.pop("bidding_zone", UNSET))

        def _parse_end_user(data: object) -> AccountingPointEndUserResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                end_user_type_0 = AccountingPointEndUserResponse.from_dict(data)

                return end_user_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointEndUserResponse | None | Unset, data)

        end_user = _parse_end_user(d.pop("end_user", UNSET))

        def _parse_energy_supplier(data: object) -> AccountingPointEnergySupplierResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                energy_supplier_type_0 = AccountingPointEnergySupplierResponse.from_dict(data)

                return energy_supplier_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointEnergySupplierResponse | None | Unset, data)

        energy_supplier = _parse_energy_supplier(d.pop("energy_supplier", UNSET))

        def _parse_metering_grid_area(data: object) -> AccountingPointMeteringGridAreaResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                metering_grid_area_type_0 = AccountingPointMeteringGridAreaResponse.from_dict(data)

                return metering_grid_area_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointMeteringGridAreaResponse | None | Unset, data)

        metering_grid_area = _parse_metering_grid_area(d.pop("metering_grid_area", UNSET))

        accounting_point_response = cls(
            id=id,
            business_id=business_id,
            system_operator_id=system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            controllable_unit=controllable_unit,
            system_operator=system_operator,
            balance_responsible_party=balance_responsible_party,
            bidding_zone=bidding_zone,
            end_user=end_user,
            energy_supplier=energy_supplier,
            metering_grid_area=metering_grid_area,
        )

        accounting_point_response.additional_properties = d
        return accounting_point_response

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
