from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_suspension_reason import ServiceProvidingGroupGridSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridSuspensionCreateData")


@_attrs_define
class ServiceProvidingGroupGridSuspensionCreateData:
    """Data of the request schema for create operations - The relation allowing an impacted system operator to temporarily
    suspend a service providing group from delivering products.

        Attributes:
            reason (Union[Unset, ServiceProvidingGroupGridSuspensionReason]): The reason for the suspension. Example:
                significant_group_change.
            impacted_system_operator_id (Union[Unset, int]): Reference to the impacted system operator suspending the
                service providing group. Example: 7.
            service_providing_group_id (Union[Unset, int]): Reference to the service providing group being suspended.
                Example: 13.
    """

    reason: Union[Unset, ServiceProvidingGroupGridSuspensionReason] = UNSET
    impacted_system_operator_id: Union[Unset, int] = UNSET
    service_providing_group_id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        reason: Union[Unset, str] = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        impacted_system_operator_id = self.impacted_system_operator_id

        service_providing_group_id = self.service_providing_group_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if reason is not UNSET:
            field_dict["reason"] = reason
        if impacted_system_operator_id is not UNSET:
            field_dict["impacted_system_operator_id"] = impacted_system_operator_id
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _reason = d.pop("reason", UNSET)
        reason: Union[Unset, ServiceProvidingGroupGridSuspensionReason]
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ServiceProvidingGroupGridSuspensionReason(_reason)

        impacted_system_operator_id = d.pop("impacted_system_operator_id", UNSET)

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        service_providing_group_grid_suspension_create_data = cls(
            reason=reason,
            impacted_system_operator_id=impacted_system_operator_id,
            service_providing_group_id=service_providing_group_id,
        )

        service_providing_group_grid_suspension_create_data.additional_properties = d
        return service_providing_group_grid_suspension_create_data

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
