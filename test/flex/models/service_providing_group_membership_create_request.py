from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupMembershipCreateRequest")


@_attrs_define
class ServiceProvidingGroupMembershipCreateRequest:
    """Request schema for create operations - Membership relation of controllable unit in service providing group

    Attributes:
        controllable_unit_id (int): Reference to the controllable unit this relation links to a service providing group.
            Example: 6.
        service_providing_group_id (int): Reference to the service providing group this relation links to a controllable
            unit. Example: 55.
        valid_from (Union[Unset, str]): The date from which the relation between the controllable unit and the service
            providing group is valid. Example: 2022-08-08 12:00:00 CET.
        valid_to (Union[None, Unset, str]): The date until which the relation between the controllable unit and the
            service providing group is valid.
    """

    controllable_unit_id: int
    service_providing_group_id: int
    valid_from: Union[Unset, str] = UNSET
    valid_to: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        controllable_unit_id = self.controllable_unit_id

        service_providing_group_id = self.service_providing_group_id

        valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "controllable_unit_id": controllable_unit_id,
                "service_providing_group_id": service_providing_group_id,
            }
        )
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        controllable_unit_id = d.pop("controllable_unit_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        service_providing_group_membership_create_request = cls(
            controllable_unit_id=controllable_unit_id,
            service_providing_group_id=service_providing_group_id,
            valid_from=valid_from,
            valid_to=valid_to,
        )

        service_providing_group_membership_create_request.additional_properties = d
        return service_providing_group_membership_create_request

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
