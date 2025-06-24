from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_status import ServiceProvidingGroupStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroup")


@_attrs_define
class ServiceProvidingGroup:
    """Data schema - Group of controllable units

    Attributes:
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        name (Union[Unset, str]): Free text name of the service providing group. Example: Batteries #09.
        status (Union[Unset, ServiceProvidingGroupStatus]): The status of the group. Example: active.
        service_provider_id (Union[Unset, int]): Reference to the `party` (service provider) managing the group.
            Example: 17.
        id (Union[Unset, int]): Unique surrogate key. Example: 4.
    """

    recorded_at: str
    recorded_by: int
    name: Union[Unset, str] = UNSET
    status: Union[Unset, ServiceProvidingGroupStatus] = UNSET
    service_provider_id: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        name = self.name

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        service_provider_id = self.service_provider_id

        id = self.id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if name is not UNSET:
            field_dict["name"] = name
        if status is not UNSET:
            field_dict["status"] = status
        if service_provider_id is not UNSET:
            field_dict["service_provider_id"] = service_provider_id
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        name = d.pop("name", UNSET)

        _status = d.pop("status", UNSET)
        status: Union[Unset, ServiceProvidingGroupStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProvidingGroupStatus(_status)

        service_provider_id = d.pop("service_provider_id", UNSET)

        id = d.pop("id", UNSET)

        service_providing_group = cls(
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            name=name,
            status=status,
            service_provider_id=service_provider_id,
            id=id,
        )

        service_providing_group.additional_properties = d
        return service_providing_group

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
