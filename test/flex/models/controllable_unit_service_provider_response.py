from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitServiceProviderResponse")


@_attrs_define
class ControllableUnitServiceProviderResponse:
    """Response schema for operations with return values - Relation between controllable unit and service provider

    Attributes:
        contract_reference (str | Unset): The service providers internal reference to the contract with the end user.
            Typically an internal identifier to a stored document or consent record. Example:
            123e4567-e89b-12d3-a456-426614174000.
        valid_from (None | str | Unset): The date from which the relation between the controllable unit and the service
            provider is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
        valid_to (None | str | Unset): The date until which the relation between the controllable unit and the service
            provider is valid. Midnight aligned on Norwegian timezone. Example: 2022-09-10 00:00:00 CET.
        controllable_unit_id (int | Unset): Reference to the controllable unit this relation links to a service
            provider. Example: 2.
        service_provider_id (int | Unset): Reference to the `party` (service provider) this relation links to a
            controllable unit. Example: 78.
        end_user_id (int | Unset): Technical ID of the end user behind the accounting point.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate key. Example: 7.
    """

    contract_reference: str | Unset = UNSET
    valid_from: None | str | Unset = UNSET
    valid_to: None | str | Unset = UNSET
    controllable_unit_id: int | Unset = UNSET
    service_provider_id: int | Unset = UNSET
    end_user_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        contract_reference = self.contract_reference

        valid_from: None | str | Unset
        if isinstance(self.valid_from, Unset):
            valid_from = UNSET
        else:
            valid_from = self.valid_from

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        controllable_unit_id = self.controllable_unit_id

        service_provider_id = self.service_provider_id

        end_user_id = self.end_user_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if contract_reference is not UNSET:
            field_dict["contract_reference"] = contract_reference
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if controllable_unit_id is not UNSET:
            field_dict["controllable_unit_id"] = controllable_unit_id
        if service_provider_id is not UNSET:
            field_dict["service_provider_id"] = service_provider_id
        if end_user_id is not UNSET:
            field_dict["end_user_id"] = end_user_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        contract_reference = d.pop("contract_reference", UNSET)

        def _parse_valid_from(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        valid_from = _parse_valid_from(d.pop("valid_from", UNSET))

        def _parse_valid_to(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        controllable_unit_id = d.pop("controllable_unit_id", UNSET)

        service_provider_id = d.pop("service_provider_id", UNSET)

        end_user_id = d.pop("end_user_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        controllable_unit_service_provider_response = cls(
            contract_reference=contract_reference,
            valid_from=valid_from,
            valid_to=valid_to,
            controllable_unit_id=controllable_unit_id,
            service_provider_id=service_provider_id,
            end_user_id=end_user_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        controllable_unit_service_provider_response.additional_properties = d
        return controllable_unit_service_provider_response

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
