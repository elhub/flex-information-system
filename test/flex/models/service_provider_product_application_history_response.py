from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.service_provider_product_application_status import ServiceProviderProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationHistoryResponse")


@_attrs_define
class ServiceProviderProductApplicationHistoryResponse:
    """Service Provider Product Application - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        service_provider_id (int): Reference to the service provider. Example: 18.
        system_operator_id (int): Reference to the system operator. Example: 39.
        product_type_ids (list[int]): References to the product types. Example: [2, 4, 5].
        status (ServiceProviderProductApplicationStatus): The status of the application. Example: in_progress.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        service_provider_product_application_id (int): Reference to the resource that was updated. Example: 48.
        qualified_at (datetime.datetime | None | Unset): When the product application was last validated. Example:
            2022-08-08T12:00:00+02.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    service_provider_id: int
    system_operator_id: int
    product_type_ids: list[int]
    status: ServiceProviderProductApplicationStatus
    recorded_at: datetime.datetime
    recorded_by: int
    service_provider_product_application_id: int
    qualified_at: datetime.datetime | None | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        service_provider_id = self.service_provider_id

        system_operator_id = self.system_operator_id

        product_type_ids = self.product_type_ids

        status = self.status.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_provider_product_application_id = self.service_provider_product_application_id

        qualified_at: None | str | Unset
        if isinstance(self.qualified_at, Unset):
            qualified_at = UNSET
        elif isinstance(self.qualified_at, datetime.datetime):
            qualified_at = self.qualified_at.isoformat()
        else:
            qualified_at = self.qualified_at

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
                "service_provider_id": service_provider_id,
                "system_operator_id": system_operator_id,
                "product_type_ids": product_type_ids,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "service_provider_product_application_id": service_provider_product_application_id,
            }
        )
        if qualified_at is not UNSET:
            field_dict["qualified_at"] = qualified_at
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        service_provider_id = d.pop("service_provider_id")

        system_operator_id = d.pop("system_operator_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        status = ServiceProviderProductApplicationStatus(d.pop("status"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        service_provider_product_application_id = d.pop("service_provider_product_application_id")

        def _parse_qualified_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                qualified_at_type_0 = isoparse(data)

                return qualified_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        qualified_at = _parse_qualified_at(d.pop("qualified_at", UNSET))

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

        service_provider_product_application_history_response = cls(
            id=id,
            service_provider_id=service_provider_id,
            system_operator_id=system_operator_id,
            product_type_ids=product_type_ids,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_provider_product_application_id=service_provider_product_application_id,
            qualified_at=qualified_at,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_provider_product_application_history_response.additional_properties = d
        return service_provider_product_application_history_response

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
