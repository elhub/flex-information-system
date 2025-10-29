from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_reason import ServiceProvidingGroupProductSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductSuspension")


@_attrs_define
class ServiceProvidingGroupProductSuspension:
    """Data schema - The relation allowing a procuring system operator to temporarily suspend a service providing group
    from delivering products of certain types.

        Attributes:
            product_type_ids (Union[Unset, list[int]]): References to the suspended product types. Example: [3, 6].
            reason (Union[Unset, ServiceProvidingGroupProductSuspensionReason]): The reason for the suspension. Example:
                failed_verification.
            procuring_system_operator_id (Union[Unset, int]): Reference to the procuring system operator suspending the
                service providing group. Example: 91.
            service_providing_group_id (Union[Unset, int]): Reference to the service providing group being suspended.
                Example: 7.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
            id (Union[Unset, int]): Unique surrogate identifier. Example: 12.
    """

    product_type_ids: Union[Unset, list[int]] = UNSET
    reason: Union[Unset, ServiceProvidingGroupProductSuspensionReason] = UNSET
    procuring_system_operator_id: Union[Unset, int] = UNSET
    service_providing_group_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        product_type_ids: Union[Unset, list[int]] = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        reason: Union[Unset, str] = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        procuring_system_operator_id = self.procuring_system_operator_id

        service_providing_group_id = self.service_providing_group_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if reason is not UNSET:
            field_dict["reason"] = reason
        if procuring_system_operator_id is not UNSET:
            field_dict["procuring_system_operator_id"] = procuring_system_operator_id
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
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

        _reason = d.pop("reason", UNSET)
        reason: Union[Unset, ServiceProvidingGroupProductSuspensionReason]
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ServiceProvidingGroupProductSuspensionReason(_reason)

        procuring_system_operator_id = d.pop("procuring_system_operator_id", UNSET)

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        service_providing_group_product_suspension = cls(
            product_type_ids=product_type_ids,
            reason=reason,
            procuring_system_operator_id=procuring_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        service_providing_group_product_suspension.additional_properties = d
        return service_providing_group_product_suspension

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
