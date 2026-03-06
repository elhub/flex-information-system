from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitServiceProviderCreateRequest")


@_attrs_define
class ControllableUnitServiceProviderCreateRequest:
    """Request schema for create operations - Relation between controllable unit and service provider

    Attributes:
        controllable_unit_id (int): Reference to the controllable unit this relation links to a service provider.
            Example: 2.
        service_provider_id (int): Reference to the `party` (service provider) this relation links to a controllable
            unit. Example: 78.
        end_user_id (int): Technical ID of the end user behind the accounting point.
        contract_reference (str): The service providers internal reference to the contract with the end user. Typically
            an internal identifier to a stored document or consent record. Example: 123e4567-e89b-12d3-a456-426614174000.
        valid_from (datetime.datetime | None | Unset): The date from which the relation between the controllable unit
            and the service provider is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08T00:00:00+02.
        valid_to (datetime.datetime | None | Unset): The date until which the relation between the controllable unit and
            the service provider is valid. Midnight aligned on Norwegian timezone. Example: 2022-09-10T00:00:00+02.
    """

    controllable_unit_id: int
    service_provider_id: int
    end_user_id: int
    contract_reference: str
    valid_from: datetime.datetime | None | Unset = UNSET
    valid_to: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        controllable_unit_id = self.controllable_unit_id

        service_provider_id = self.service_provider_id

        end_user_id = self.end_user_id

        contract_reference = self.contract_reference

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

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "controllable_unit_id": controllable_unit_id,
                "service_provider_id": service_provider_id,
                "end_user_id": end_user_id,
                "contract_reference": contract_reference,
            }
        )
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        controllable_unit_id = d.pop("controllable_unit_id")

        service_provider_id = d.pop("service_provider_id")

        end_user_id = d.pop("end_user_id")

        contract_reference = d.pop("contract_reference")

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

        controllable_unit_service_provider_create_request = cls(
            controllable_unit_id=controllable_unit_id,
            service_provider_id=service_provider_id,
            end_user_id=end_user_id,
            contract_reference=contract_reference,
            valid_from=valid_from,
            valid_to=valid_to,
        )

        controllable_unit_service_provider_create_request.additional_properties = d
        return controllable_unit_service_provider_create_request

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
