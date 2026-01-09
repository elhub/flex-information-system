from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_suspension_reason import ServiceProviderProductSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductSuspensionCreateRequest")


@_attrs_define
class ServiceProviderProductSuspensionCreateRequest:
    """Request schema for create operations - The relation allowing a procuring system operator to temporarily suspend a
    service provider from delivering them products of the given types.

        Attributes:
            service_provider_id (int): Reference to the service provider being suspended. Example: 52.
            product_type_ids (list[int]): References to the suspended product types. Example: [1, 7].
            reason (ServiceProviderProductSuspensionReason): The reason for the suspension. Example: communication_issues.
            procuring_system_operator_id (int | Unset): Reference to the procuring system operator suspending the service
                provider. Example: 9.
    """

    service_provider_id: int
    product_type_ids: list[int]
    reason: ServiceProviderProductSuspensionReason
    procuring_system_operator_id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_provider_id = self.service_provider_id

        product_type_ids = self.product_type_ids

        reason = self.reason.value

        procuring_system_operator_id = self.procuring_system_operator_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_provider_id": service_provider_id,
                "product_type_ids": product_type_ids,
                "reason": reason,
            }
        )
        if procuring_system_operator_id is not UNSET:
            field_dict["procuring_system_operator_id"] = procuring_system_operator_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_provider_id = d.pop("service_provider_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        reason = ServiceProviderProductSuspensionReason(d.pop("reason"))

        procuring_system_operator_id = d.pop("procuring_system_operator_id", UNSET)

        service_provider_product_suspension_create_request = cls(
            service_provider_id=service_provider_id,
            product_type_ids=product_type_ids,
            reason=reason,
            procuring_system_operator_id=procuring_system_operator_id,
        )

        service_provider_product_suspension_create_request.additional_properties = d
        return service_provider_product_suspension_create_request

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
