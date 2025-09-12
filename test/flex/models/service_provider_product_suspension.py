from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_suspension_reason import ServiceProviderProductSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductSuspension")


@_attrs_define
class ServiceProviderProductSuspension:
    """Data schema - The relation allowing a procuring system operator to temporarily suspend a service provider from
    delivering them products of the given types.

        Attributes:
            product_type_ids (Union[Unset, List[int]]): References to the suspended product types. Example: [1, 7].
            reason (Union[Unset, ServiceProviderProductSuspensionReason]): The reason for the suspension. Example:
                communication_issues.
            procuring_system_operator_id (Union[Unset, int]): Reference to the procuring system operator suspending the
                service provider. Example: 9.
            service_provider_id (Union[Unset, int]): Reference to the service provider being suspended. Example: 52.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
            id (Union[Unset, int]): Unique surrogate identifier. Example: 74.
    """

    product_type_ids: Union[Unset, List[int]] = UNSET
    reason: Union[Unset, ServiceProviderProductSuspensionReason] = UNSET
    procuring_system_operator_id: Union[Unset, int] = UNSET
    service_provider_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        product_type_ids: Union[Unset, List[int]] = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        reason: Union[Unset, str] = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        procuring_system_operator_id = self.procuring_system_operator_id

        service_provider_id = self.service_provider_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if reason is not UNSET:
            field_dict["reason"] = reason
        if procuring_system_operator_id is not UNSET:
            field_dict["procuring_system_operator_id"] = procuring_system_operator_id
        if service_provider_id is not UNSET:
            field_dict["service_provider_id"] = service_provider_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        product_type_ids = cast(List[int], d.pop("product_type_ids", UNSET))

        _reason = d.pop("reason", UNSET)
        reason: Union[Unset, ServiceProviderProductSuspensionReason]
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ServiceProviderProductSuspensionReason(_reason)

        procuring_system_operator_id = d.pop("procuring_system_operator_id", UNSET)

        service_provider_id = d.pop("service_provider_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        service_provider_product_suspension = cls(
            product_type_ids=product_type_ids,
            reason=reason,
            procuring_system_operator_id=procuring_system_operator_id,
            service_provider_id=service_provider_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        service_provider_product_suspension.additional_properties = d
        return service_provider_product_suspension

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
