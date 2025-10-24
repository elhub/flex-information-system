from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupMembershipCreateData")


@_attrs_define
class ServiceProvidingGroupMembershipCreateData:
    """Data of the request schema for create operations - Membership relation of controllable unit in service providing
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
    """

    valid_from: Union[Unset, str] = UNSET
    valid_to: Union[None, Unset, str] = UNSET
    controllable_unit_id: Union[Unset, int] = UNSET
    service_providing_group_id: Union[Unset, int] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        controllable_unit_id = self.controllable_unit_id

        service_providing_group_id = self.service_providing_group_id

        field_dict: dict[str, Any] = {}
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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
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

        service_providing_group_membership_create_data = cls(
            valid_from=valid_from,
            valid_to=valid_to,
            controllable_unit_id=controllable_unit_id,
            service_providing_group_id=service_providing_group_id,
        )

        service_providing_group_membership_create_data.additional_properties = d
        return service_providing_group_membership_create_data

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
