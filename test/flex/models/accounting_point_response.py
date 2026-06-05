from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_balance_responsible_party_response import (
        AccountingPointBalanceResponsiblePartyResponse,
    )
    from ..models.accounting_point_bidding_zone_response import AccountingPointBiddingZoneResponse
    from ..models.accounting_point_end_user_response import AccountingPointEndUserResponse
    from ..models.accounting_point_energy_supplier_response import AccountingPointEnergySupplierResponse
    from ..models.accounting_point_grid_location_response import AccountingPointGridLocationResponse
    from ..models.accounting_point_metering_grid_area_response import AccountingPointMeteringGridAreaResponse
    from ..models.accounting_point_response_location_type_0 import AccountingPointResponseLocationType0
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
        location (AccountingPointResponseLocationType0 | None | Unset): Geographic location of the accounting point
            (WGS84), as a GeoJSON point object. Example: {'type': 'Point', 'crs': {'type': 'name', 'properties': {'name':
            'EPSG:4326'}}, 'coordinates': [-2.0259056, 48.6504504]}.
        controllable_unit (list[ControllableUnitResponse] | None | Unset): Embedded controllable_unit
        system_operator (None | PartyResponse | Unset): Embedded party
        balance_responsible_party (list[AccountingPointBalanceResponsiblePartyResponse] | None | Unset): Embedded
            accounting_point_balance_responsible_party
        bidding_zone (list[AccountingPointBiddingZoneResponse] | None | Unset): Embedded accounting_point_bidding_zone
        end_user (list[AccountingPointEndUserResponse] | None | Unset): Embedded accounting_point_end_user
        energy_supplier (list[AccountingPointEnergySupplierResponse] | None | Unset): Embedded
            accounting_point_energy_supplier
        metering_grid_area (list[AccountingPointMeteringGridAreaResponse] | None | Unset): Embedded
            accounting_point_metering_grid_area
        grid_location (AccountingPointGridLocationResponse | None | Unset): Embedded accounting_point_grid_location
    """

    id: int
    business_id: str
    system_operator_id: int
    recorded_at: datetime.datetime
    recorded_by: int
    location: AccountingPointResponseLocationType0 | None | Unset = UNSET
    controllable_unit: list[ControllableUnitResponse] | None | Unset = UNSET
    system_operator: None | PartyResponse | Unset = UNSET
    balance_responsible_party: list[AccountingPointBalanceResponsiblePartyResponse] | None | Unset = UNSET
    bidding_zone: list[AccountingPointBiddingZoneResponse] | None | Unset = UNSET
    end_user: list[AccountingPointEndUserResponse] | None | Unset = UNSET
    energy_supplier: list[AccountingPointEnergySupplierResponse] | None | Unset = UNSET
    metering_grid_area: list[AccountingPointMeteringGridAreaResponse] | None | Unset = UNSET
    grid_location: AccountingPointGridLocationResponse | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_grid_location_response import AccountingPointGridLocationResponse
        from ..models.accounting_point_response_location_type_0 import AccountingPointResponseLocationType0
        from ..models.party_response import PartyResponse

        id = self.id

        business_id = self.business_id

        system_operator_id = self.system_operator_id

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        location: dict[str, Any] | None | Unset
        if isinstance(self.location, Unset):
            location = UNSET
        elif isinstance(self.location, AccountingPointResponseLocationType0):
            location = self.location.to_dict()
        else:
            location = self.location

        controllable_unit: list[dict[str, Any]] | None | Unset
        if isinstance(self.controllable_unit, Unset):
            controllable_unit = UNSET
        elif isinstance(self.controllable_unit, list):
            controllable_unit = []
            for controllable_unit_type_0_item_data in self.controllable_unit:
                controllable_unit_type_0_item = controllable_unit_type_0_item_data.to_dict()
                controllable_unit.append(controllable_unit_type_0_item)

        else:
            controllable_unit = self.controllable_unit

        system_operator: dict[str, Any] | None | Unset
        if isinstance(self.system_operator, Unset):
            system_operator = UNSET
        elif isinstance(self.system_operator, PartyResponse):
            system_operator = self.system_operator.to_dict()
        else:
            system_operator = self.system_operator

        balance_responsible_party: list[dict[str, Any]] | None | Unset
        if isinstance(self.balance_responsible_party, Unset):
            balance_responsible_party = UNSET
        elif isinstance(self.balance_responsible_party, list):
            balance_responsible_party = []
            for balance_responsible_party_type_0_item_data in self.balance_responsible_party:
                balance_responsible_party_type_0_item = balance_responsible_party_type_0_item_data.to_dict()
                balance_responsible_party.append(balance_responsible_party_type_0_item)

        else:
            balance_responsible_party = self.balance_responsible_party

        bidding_zone: list[dict[str, Any]] | None | Unset
        if isinstance(self.bidding_zone, Unset):
            bidding_zone = UNSET
        elif isinstance(self.bidding_zone, list):
            bidding_zone = []
            for bidding_zone_type_0_item_data in self.bidding_zone:
                bidding_zone_type_0_item = bidding_zone_type_0_item_data.to_dict()
                bidding_zone.append(bidding_zone_type_0_item)

        else:
            bidding_zone = self.bidding_zone

        end_user: list[dict[str, Any]] | None | Unset
        if isinstance(self.end_user, Unset):
            end_user = UNSET
        elif isinstance(self.end_user, list):
            end_user = []
            for end_user_type_0_item_data in self.end_user:
                end_user_type_0_item = end_user_type_0_item_data.to_dict()
                end_user.append(end_user_type_0_item)

        else:
            end_user = self.end_user

        energy_supplier: list[dict[str, Any]] | None | Unset
        if isinstance(self.energy_supplier, Unset):
            energy_supplier = UNSET
        elif isinstance(self.energy_supplier, list):
            energy_supplier = []
            for energy_supplier_type_0_item_data in self.energy_supplier:
                energy_supplier_type_0_item = energy_supplier_type_0_item_data.to_dict()
                energy_supplier.append(energy_supplier_type_0_item)

        else:
            energy_supplier = self.energy_supplier

        metering_grid_area: list[dict[str, Any]] | None | Unset
        if isinstance(self.metering_grid_area, Unset):
            metering_grid_area = UNSET
        elif isinstance(self.metering_grid_area, list):
            metering_grid_area = []
            for metering_grid_area_type_0_item_data in self.metering_grid_area:
                metering_grid_area_type_0_item = metering_grid_area_type_0_item_data.to_dict()
                metering_grid_area.append(metering_grid_area_type_0_item)

        else:
            metering_grid_area = self.metering_grid_area

        grid_location: dict[str, Any] | None | Unset
        if isinstance(self.grid_location, Unset):
            grid_location = UNSET
        elif isinstance(self.grid_location, AccountingPointGridLocationResponse):
            grid_location = self.grid_location.to_dict()
        else:
            grid_location = self.grid_location

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
        if location is not UNSET:
            field_dict["location"] = location
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
        if grid_location is not UNSET:
            field_dict["grid_location"] = grid_location

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_balance_responsible_party_response import (
            AccountingPointBalanceResponsiblePartyResponse,
        )
        from ..models.accounting_point_bidding_zone_response import AccountingPointBiddingZoneResponse
        from ..models.accounting_point_end_user_response import AccountingPointEndUserResponse
        from ..models.accounting_point_energy_supplier_response import AccountingPointEnergySupplierResponse
        from ..models.accounting_point_grid_location_response import AccountingPointGridLocationResponse
        from ..models.accounting_point_metering_grid_area_response import AccountingPointMeteringGridAreaResponse
        from ..models.accounting_point_response_location_type_0 import AccountingPointResponseLocationType0
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        system_operator_id = d.pop("system_operator_id")

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_location(data: object) -> AccountingPointResponseLocationType0 | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                location_type_0 = AccountingPointResponseLocationType0.from_dict(data)

                return location_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointResponseLocationType0 | None | Unset, data)

        location = _parse_location(d.pop("location", UNSET))

        def _parse_controllable_unit(data: object) -> list[ControllableUnitResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                controllable_unit_type_0 = []
                _controllable_unit_type_0 = data
                for controllable_unit_type_0_item_data in _controllable_unit_type_0:
                    controllable_unit_type_0_item = ControllableUnitResponse.from_dict(
                        controllable_unit_type_0_item_data
                    )

                    controllable_unit_type_0.append(controllable_unit_type_0_item)

                return controllable_unit_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitResponse] | None | Unset, data)

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
        ) -> list[AccountingPointBalanceResponsiblePartyResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                balance_responsible_party_type_0 = []
                _balance_responsible_party_type_0 = data
                for balance_responsible_party_type_0_item_data in _balance_responsible_party_type_0:
                    balance_responsible_party_type_0_item = AccountingPointBalanceResponsiblePartyResponse.from_dict(
                        balance_responsible_party_type_0_item_data
                    )

                    balance_responsible_party_type_0.append(balance_responsible_party_type_0_item)

                return balance_responsible_party_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[AccountingPointBalanceResponsiblePartyResponse] | None | Unset, data)

        balance_responsible_party = _parse_balance_responsible_party(d.pop("balance_responsible_party", UNSET))

        def _parse_bidding_zone(data: object) -> list[AccountingPointBiddingZoneResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                bidding_zone_type_0 = []
                _bidding_zone_type_0 = data
                for bidding_zone_type_0_item_data in _bidding_zone_type_0:
                    bidding_zone_type_0_item = AccountingPointBiddingZoneResponse.from_dict(
                        bidding_zone_type_0_item_data
                    )

                    bidding_zone_type_0.append(bidding_zone_type_0_item)

                return bidding_zone_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[AccountingPointBiddingZoneResponse] | None | Unset, data)

        bidding_zone = _parse_bidding_zone(d.pop("bidding_zone", UNSET))

        def _parse_end_user(data: object) -> list[AccountingPointEndUserResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                end_user_type_0 = []
                _end_user_type_0 = data
                for end_user_type_0_item_data in _end_user_type_0:
                    end_user_type_0_item = AccountingPointEndUserResponse.from_dict(end_user_type_0_item_data)

                    end_user_type_0.append(end_user_type_0_item)

                return end_user_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[AccountingPointEndUserResponse] | None | Unset, data)

        end_user = _parse_end_user(d.pop("end_user", UNSET))

        def _parse_energy_supplier(data: object) -> list[AccountingPointEnergySupplierResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                energy_supplier_type_0 = []
                _energy_supplier_type_0 = data
                for energy_supplier_type_0_item_data in _energy_supplier_type_0:
                    energy_supplier_type_0_item = AccountingPointEnergySupplierResponse.from_dict(
                        energy_supplier_type_0_item_data
                    )

                    energy_supplier_type_0.append(energy_supplier_type_0_item)

                return energy_supplier_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[AccountingPointEnergySupplierResponse] | None | Unset, data)

        energy_supplier = _parse_energy_supplier(d.pop("energy_supplier", UNSET))

        def _parse_metering_grid_area(data: object) -> list[AccountingPointMeteringGridAreaResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                metering_grid_area_type_0 = []
                _metering_grid_area_type_0 = data
                for metering_grid_area_type_0_item_data in _metering_grid_area_type_0:
                    metering_grid_area_type_0_item = AccountingPointMeteringGridAreaResponse.from_dict(
                        metering_grid_area_type_0_item_data
                    )

                    metering_grid_area_type_0.append(metering_grid_area_type_0_item)

                return metering_grid_area_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[AccountingPointMeteringGridAreaResponse] | None | Unset, data)

        metering_grid_area = _parse_metering_grid_area(d.pop("metering_grid_area", UNSET))

        def _parse_grid_location(data: object) -> AccountingPointGridLocationResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                grid_location_type_0 = AccountingPointGridLocationResponse.from_dict(data)

                return grid_location_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointGridLocationResponse | None | Unset, data)

        grid_location = _parse_grid_location(d.pop("grid_location", UNSET))

        accounting_point_response = cls(
            id=id,
            business_id=business_id,
            system_operator_id=system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            location=location,
            controllable_unit=controllable_unit,
            system_operator=system_operator,
            balance_responsible_party=balance_responsible_party,
            bidding_zone=bidding_zone,
            end_user=end_user,
            energy_supplier=energy_supplier,
            metering_grid_area=metering_grid_area,
            grid_location=grid_location,
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
