from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupMembershipResponse")


@_attrs_define
class ServiceProvidingGroupMembershipResponse:
    """Response schema for operations with return values - Membership relation of controllable unit in service providing
    group

        Attributes:
            valid_from (Union[Unset, str]): The date from which the relation between the controllable unit and the service
                providing group is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
            valid_to (Union[None, Unset, str]): The date until which the relation between the controllable unit and the
                service providing group is valid. Midnight aligned on Norwegian timezone.
            controllable_unit_id (Union[Unset, int]): Reference to the controllable unit this relation links to a service
                providing group. Example: 6.
            service_providing_group_id (Union[Unset, int]): Reference to the service providing group this relation links to
                a controllable unit. Example: 55.
            id (Union[Unset, int]): Unique surrogate key. Example: 27.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
    """

    valid_from: Union[Unset, str] = UNSET
    valid_to: Union[None, Unset, str] = UNSET
    controllable_unit_id: Union[Unset, int] = UNSET
    service_providing_group_id: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        controllable_unit_id = self.controllable_unit_id

        service_providing_group_id = self.service_providing_group_id

        id = self.id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if controllable_unit_id is not UNSET:
            field_dict["controllable_unit_id"] = controllable_unit_id
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
        if id is not UNSET:
            field_dict["id"] = id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        controllable_unit_id = d.pop("controllable_unit_id", UNSET)

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        id = d.pop("id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        service_providing_group_membership_response = cls(
            valid_from=valid_from,
            valid_to=valid_to,
            controllable_unit_id=controllable_unit_id,
            service_providing_group_id=service_providing_group_id,
            id=id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        service_providing_group_membership_response.additional_properties = d
        return service_providing_group_membership_response

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
