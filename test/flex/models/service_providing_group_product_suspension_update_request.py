from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_reason import ServiceProvidingGroupProductSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductSuspensionUpdateRequest")


@_attrs_define
class ServiceProvidingGroupProductSuspensionUpdateRequest:
    """Request schema for update operations - The relation allowing a procuring system operator to temporarily suspend a
    service providing group from delivering products of certain types.

        Attributes:
            product_type_ids (Union[Unset, list[int]]): References to the suspended product types. Example: [3, 6].
            reason (Union[Unset, ServiceProvidingGroupProductSuspensionReason]): The reason for the suspension. Example:
                failed_verification.
    """

    product_type_ids: Union[Unset, list[int]] = UNSET
    reason: Union[Unset, ServiceProvidingGroupProductSuspensionReason] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        product_type_ids: Union[Unset, list[int]] = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        reason: Union[Unset, str] = UNSET
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
        reason: Union[Unset, ServiceProvidingGroupProductSuspensionReason]
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ServiceProvidingGroupProductSuspensionReason(_reason)

        service_providing_group_product_suspension_update_request = cls(
            product_type_ids=product_type_ids,
            reason=reason,
        )

        service_providing_group_product_suspension_update_request.additional_properties = d
        return service_providing_group_product_suspension_update_request

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
