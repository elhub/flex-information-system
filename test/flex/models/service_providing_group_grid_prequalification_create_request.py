from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_prequalification_status import (
    ServiceProvidingGroupGridPrequalificationStatus,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationCreateRequest")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationCreateRequest:
    """Request schema for create operations - Grid prequalification for service providing group

    Attributes:
        service_providing_group_id (int): Reference to the service providing group whose grid prequalification is
            tracked by the current resource. Example: 55.
        impacted_system_operator_id (int): Reference to the `party` that is the impacted system operator. Example: 7.
        status (Union[Unset, ServiceProvidingGroupGridPrequalificationStatus]): The status of the grid prequalification
            for this service providing group. Example: in_progress.
        notes (Union[None, Unset, str]): Free text notes on the current prequalification status.
        last_prequalified (Union[None, Unset, str]): When the current grid prequalification was last approved. Example:
            2023-01-08 10:00:00 CET.
    """

    service_providing_group_id: int
    impacted_system_operator_id: int
    status: Union[Unset, ServiceProvidingGroupGridPrequalificationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    last_prequalified: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        service_providing_group_id = self.service_providing_group_id

        impacted_system_operator_id = self.impacted_system_operator_id

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        notes: Union[None, Unset, str]
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        last_prequalified: Union[None, Unset, str]
        if isinstance(self.last_prequalified, Unset):
            last_prequalified = UNSET
        else:
            last_prequalified = self.last_prequalified

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_providing_group_id": service_providing_group_id,
                "impacted_system_operator_id": impacted_system_operator_id,
            }
        )
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if last_prequalified is not UNSET:
            field_dict["last_prequalified"] = last_prequalified

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        service_providing_group_id = d.pop("service_providing_group_id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        _status = d.pop("status", UNSET)
        status: Union[Unset, ServiceProvidingGroupGridPrequalificationStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProvidingGroupGridPrequalificationStatus(_status)

        def _parse_notes(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        notes = _parse_notes(d.pop("notes", UNSET))

        def _parse_last_prequalified(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        last_prequalified = _parse_last_prequalified(d.pop("last_prequalified", UNSET))

        service_providing_group_grid_prequalification_create_request = cls(
            service_providing_group_id=service_providing_group_id,
            impacted_system_operator_id=impacted_system_operator_id,
            status=status,
            notes=notes,
            last_prequalified=last_prequalified,
        )

        service_providing_group_grid_prequalification_create_request.additional_properties = d
        return service_providing_group_grid_prequalification_create_request

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
