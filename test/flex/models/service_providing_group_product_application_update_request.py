from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.service_providing_group_product_application_status import ServiceProvidingGroupProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductApplicationUpdateRequest")


@_attrs_define
class ServiceProvidingGroupProductApplicationUpdateRequest:
    """Request schema for update operations - Relation between a service providing group and a system operator for a
    product type, for the SPG to deliver a product to the SO later.

        Attributes:
            product_type_ids (list[int] | Unset): References to the product types. Example: [2, 4, 5].
            status (ServiceProvidingGroupProductApplicationStatus | Unset): The status of the application. Example:
                in_progress.
            maximum_active_power (float | Unset): The maximum active power applied for, in kilowatts. Example: 150.5.
            additional_information (None | str | Unset): Free text field for extra information about the application if
                needed (bidding periods, unavailabilities, etc).
            prequalified_at (datetime.datetime | None | Unset): When the product application was last prequalified. Example:
                2022-08-08T12:00:00+02.
            verified_at (datetime.datetime | None | Unset): When the product application was last verified. Example:
                2021-08-08T10:00:00+02.
    """

    product_type_ids: list[int] | Unset = UNSET
    status: ServiceProvidingGroupProductApplicationStatus | Unset = UNSET
    maximum_active_power: float | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    prequalified_at: datetime.datetime | None | Unset = UNSET
    verified_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        product_type_ids: list[int] | Unset = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        maximum_active_power = self.maximum_active_power

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        prequalified_at: None | str | Unset
        if isinstance(self.prequalified_at, Unset):
            prequalified_at = UNSET
        elif isinstance(self.prequalified_at, datetime.datetime):
            prequalified_at = self.prequalified_at.isoformat()
        else:
            prequalified_at = self.prequalified_at

        verified_at: None | str | Unset
        if isinstance(self.verified_at, Unset):
            verified_at = UNSET
        elif isinstance(self.verified_at, datetime.datetime):
            verified_at = self.verified_at.isoformat()
        else:
            verified_at = self.verified_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if status is not UNSET:
            field_dict["status"] = status
        if maximum_active_power is not UNSET:
            field_dict["maximum_active_power"] = maximum_active_power
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at
        if verified_at is not UNSET:
            field_dict["verified_at"] = verified_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        product_type_ids = cast(list[int], d.pop("product_type_ids", UNSET))

        _status = d.pop("status", UNSET)
        status: ServiceProvidingGroupProductApplicationStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProvidingGroupProductApplicationStatus(_status)

        maximum_active_power = d.pop("maximum_active_power", UNSET)

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        def _parse_prequalified_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                prequalified_at_type_0 = isoparse(data)

                return prequalified_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        prequalified_at = _parse_prequalified_at(d.pop("prequalified_at", UNSET))

        def _parse_verified_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                verified_at_type_0 = isoparse(data)

                return verified_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        verified_at = _parse_verified_at(d.pop("verified_at", UNSET))

        service_providing_group_product_application_update_request = cls(
            product_type_ids=product_type_ids,
            status=status,
            maximum_active_power=maximum_active_power,
            additional_information=additional_information,
            prequalified_at=prequalified_at,
            verified_at=verified_at,
        )

        service_providing_group_product_application_update_request.additional_properties = d
        return service_providing_group_product_application_update_request

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
