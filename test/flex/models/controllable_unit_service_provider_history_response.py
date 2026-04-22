from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_response import ControllableUnitResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="ControllableUnitServiceProviderHistoryResponse")


@_attrs_define
class ControllableUnitServiceProviderHistoryResponse:
    """Relation between controllable unit and service provider - history

    Attributes:
        id (int): Unique surrogate key. Example: 7.
        controllable_unit_id (int): Reference to the controllable unit this relation links to a service provider.
            Example: 2.
        service_provider_id (int): Reference to the `party` (service provider) this relation links to a controllable
            unit. Example: 78.
        end_user_id (int): Technical ID of the end user behind the accounting point.
        contract_reference (str): The service providers internal reference to the contract with the end user. Typically
            an internal identifier to a stored document or consent record. Example: 123e4567-e89b-12d3-a456-426614174000.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        controllable_unit_service_provider_id (int): Reference to the resource that was updated. Example: 48.
        valid_from (datetime.datetime | None | Unset): The date from which the relation between the controllable unit
            and the service provider is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08T00:00:00+02.
        valid_to (datetime.datetime | None | Unset): The date until which the relation between the controllable unit and
            the service provider is valid. Midnight aligned on Norwegian timezone. Example: 2022-09-10T00:00:00+02.
        controllable_unit (ControllableUnitResponse | None | Unset): Embedded controllable_unit
        service_provider (None | PartyResponse | Unset): Embedded party
        end_user (None | PartyResponse | Unset): Embedded party
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    controllable_unit_id: int
    service_provider_id: int
    end_user_id: int
    contract_reference: str
    recorded_at: datetime.datetime
    recorded_by: int
    controllable_unit_service_provider_id: int
    valid_from: datetime.datetime | None | Unset = UNSET
    valid_to: datetime.datetime | None | Unset = UNSET
    controllable_unit: ControllableUnitResponse | None | Unset = UNSET
    service_provider: None | PartyResponse | Unset = UNSET
    end_user: None | PartyResponse | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.party_response import PartyResponse

        id = self.id

        controllable_unit_id = self.controllable_unit_id

        service_provider_id = self.service_provider_id

        end_user_id = self.end_user_id

        contract_reference = self.contract_reference

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        controllable_unit_service_provider_id = self.controllable_unit_service_provider_id

        valid_from: None | str | Unset
        if isinstance(self.valid_from, Unset):
            valid_from = UNSET
        elif isinstance(self.valid_from, datetime.datetime):
            valid_from = self.valid_from.isoformat()
        else:
            valid_from = self.valid_from

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        elif isinstance(self.valid_to, datetime.datetime):
            valid_to = self.valid_to.isoformat()
        else:
            valid_to = self.valid_to

        controllable_unit: dict[str, Any] | None | Unset
        if isinstance(self.controllable_unit, Unset):
            controllable_unit = UNSET
        elif isinstance(self.controllable_unit, ControllableUnitResponse):
            controllable_unit = self.controllable_unit.to_dict()
        else:
            controllable_unit = self.controllable_unit

        service_provider: dict[str, Any] | None | Unset
        if isinstance(self.service_provider, Unset):
            service_provider = UNSET
        elif isinstance(self.service_provider, PartyResponse):
            service_provider = self.service_provider.to_dict()
        else:
            service_provider = self.service_provider

        end_user: dict[str, Any] | None | Unset
        if isinstance(self.end_user, Unset):
            end_user = UNSET
        elif isinstance(self.end_user, PartyResponse):
            end_user = self.end_user.to_dict()
        else:
            end_user = self.end_user

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        elif isinstance(self.replaced_at, datetime.datetime):
            replaced_at = self.replaced_at.isoformat()
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "controllable_unit_id": controllable_unit_id,
                "service_provider_id": service_provider_id,
                "end_user_id": end_user_id,
                "contract_reference": contract_reference,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "controllable_unit_service_provider_id": controllable_unit_service_provider_id,
            }
        )
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if controllable_unit is not UNSET:
            field_dict["controllable_unit"] = controllable_unit
        if service_provider is not UNSET:
            field_dict["service_provider"] = service_provider
        if end_user is not UNSET:
            field_dict["end_user"] = end_user
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        id = d.pop("id")

        controllable_unit_id = d.pop("controllable_unit_id")

        service_provider_id = d.pop("service_provider_id")

        end_user_id = d.pop("end_user_id")

        contract_reference = d.pop("contract_reference")

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        controllable_unit_service_provider_id = d.pop("controllable_unit_service_provider_id")

        def _parse_valid_from(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_from_type_0 = isoparse(data)

                return valid_from_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        valid_from = _parse_valid_from(d.pop("valid_from", UNSET))

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

        def _parse_service_provider(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_provider_type_0 = PartyResponse.from_dict(data)

                return service_provider_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        service_provider = _parse_service_provider(d.pop("service_provider", UNSET))

        def _parse_end_user(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                end_user_type_0 = PartyResponse.from_dict(data)

                return end_user_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        end_user = _parse_end_user(d.pop("end_user", UNSET))

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                replaced_at_type_0 = isoparse(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        controllable_unit_service_provider_history_response = cls(
            id=id,
            controllable_unit_id=controllable_unit_id,
            service_provider_id=service_provider_id,
            end_user_id=end_user_id,
            contract_reference=contract_reference,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            controllable_unit_service_provider_id=controllable_unit_service_provider_id,
            valid_from=valid_from,
            valid_to=valid_to,
            controllable_unit=controllable_unit,
            service_provider=service_provider,
            end_user=end_user,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        controllable_unit_service_provider_history_response.additional_properties = d
        return controllable_unit_service_provider_history_response

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
