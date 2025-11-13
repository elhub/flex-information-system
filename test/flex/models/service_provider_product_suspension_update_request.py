from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_suspension_reason import ServiceProviderProductSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductSuspensionUpdateRequest")


@_attrs_define
class ServiceProviderProductSuspensionUpdateRequest:
    """Request schema for update operations - The relation allowing a procuring system operator to temporarily suspend a
    service provider from delivering them products of the given types.

        Attributes:
            product_type_ids (list[int] | Unset): References to the suspended product types. Example: [1, 7].
            reason (ServiceProviderProductSuspensionReason | Unset): The reason for the suspension. Example:
                communication_issues.
    """

    product_type_ids: list[int] | Unset = UNSET
    reason: ServiceProviderProductSuspensionReason | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        product_type_ids: list[int] | Unset = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        reason: str | Unset = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if reason is not UNSET:
            field_dict["reason"] = reason

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        product_type_ids = cast(list[int], d.pop("product_type_ids", UNSET))

        _reason = d.pop("reason", UNSET)
        reason: ServiceProviderProductSuspensionReason | Unset
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ServiceProviderProductSuspensionReason(_reason)

        service_provider_product_suspension_update_request = cls(
            product_type_ids=product_type_ids,
            reason=reason,
        )

        service_provider_product_suspension_update_request.additional_properties = d
        return service_provider_product_suspension_update_request

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
