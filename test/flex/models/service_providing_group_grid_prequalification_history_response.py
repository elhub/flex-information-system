from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_prequalification_status import (
    ServiceProvidingGroupGridPrequalificationStatus,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationHistoryResponse")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationHistoryResponse:
    """Grid prequalification for service providing group - history

    Attributes:
        service_providing_group_id (int): Reference to the service providing group whose grid prequalification is
            tracked by the current resource. Example: 55.
        impacted_system_operator_id (int): Reference to the `party` that is the impacted system operator. Example: 7.
        status (Union[Unset, ServiceProvidingGroupGridPrequalificationStatus]): The status of the grid prequalification
            for this service providing group. Example: in_progress.
        notes (Union[None, Unset, str]): Free text notes on the current prequalification status.
        last_prequalified (Union[None, Unset, str]): When the current grid prequalification was last approved. Example:
            2023-01-08 10:00:00 CET.
        id (Union[Unset, int]): Unique surrogate key. Example: 27.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        service_providing_group_grid_prequalification_id (Union[Unset, int]): Reference to the resource that was
            updated. Example: 48.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    service_providing_group_id: int
    impacted_system_operator_id: int
    status: Union[Unset, ServiceProvidingGroupGridPrequalificationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    last_prequalified: Union[None, Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    service_providing_group_grid_prequalification_id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
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

        id = self.id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        service_providing_group_grid_prequalification_id = self.service_providing_group_grid_prequalification_id

        replaced_by: Union[None, Unset, int]
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: Union[None, Unset, str]
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

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
        if id is not UNSET:
            field_dict["id"] = id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if service_providing_group_grid_prequalification_id is not UNSET:
            field_dict["service_providing_group_grid_prequalification_id"] = (
                service_providing_group_grid_prequalification_id
            )
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

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

        id = d.pop("id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        service_providing_group_grid_prequalification_id = d.pop(
            "service_providing_group_grid_prequalification_id", UNSET
        )

        def _parse_replaced_by(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        service_providing_group_grid_prequalification_history_response = cls(
            service_providing_group_id=service_providing_group_id,
            impacted_system_operator_id=impacted_system_operator_id,
            status=status,
            notes=notes,
            last_prequalified=last_prequalified,
            id=id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_grid_prequalification_id=service_providing_group_grid_prequalification_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_providing_group_grid_prequalification_history_response.additional_properties = d
        return service_providing_group_grid_prequalification_history_response

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
