from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_status import ServiceProviderProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplication")


@_attrs_define
class ServiceProviderProductApplication:
    """Data schema - Relation between a service provider and a system operator, for the SP to apply for delivering the SO
    some of the types of product they want to buy on a flexibility market.

        Attributes:
            product_type_ids (list[int] | Unset): References to the product types. Example: [2, 4, 5].
            status (ServiceProviderProductApplicationStatus | Unset): The status of the application. Example: in_progress.
            qualified_at (None | str | Unset): When the product application was last validated. Example: 2022-08-08 12:00:00
                CET.
            service_provider_id (int | Unset): Reference to the service provider. Example: 18.
            system_operator_id (int | Unset): Reference to the system operator. Example: 39.
            recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
            id (int | Unset): Unique surrogate identifier. Example: 89.
    """

    product_type_ids: list[int] | Unset = UNSET
    status: ServiceProviderProductApplicationStatus | Unset = UNSET
    qualified_at: None | str | Unset = UNSET
    service_provider_id: int | Unset = UNSET
    system_operator_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        product_type_ids: list[int] | Unset = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        qualified_at: None | str | Unset
        if isinstance(self.qualified_at, Unset):
            qualified_at = UNSET
        else:
            qualified_at = self.qualified_at

        service_provider_id = self.service_provider_id

        system_operator_id = self.system_operator_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if status is not UNSET:
            field_dict["status"] = status
        if qualified_at is not UNSET:
            field_dict["qualified_at"] = qualified_at
        if service_provider_id is not UNSET:
            field_dict["service_provider_id"] = service_provider_id
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id
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
        product_type_ids = cast(list[int], d.pop("product_type_ids", UNSET))

        _status = d.pop("status", UNSET)
        status: ServiceProviderProductApplicationStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProviderProductApplicationStatus(_status)

        def _parse_qualified_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        qualified_at = _parse_qualified_at(d.pop("qualified_at", UNSET))

        service_provider_id = d.pop("service_provider_id", UNSET)

        system_operator_id = d.pop("system_operator_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        service_provider_product_application = cls(
            product_type_ids=product_type_ids,
            status=status,
            qualified_at=qualified_at,
            service_provider_id=service_provider_id,
            system_operator_id=system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        service_provider_product_application.additional_properties = d
        return service_provider_product_application

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
