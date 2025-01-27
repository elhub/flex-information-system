from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="TechnicalResourceCreateRequest")


@_attrs_define
class TechnicalResourceCreateRequest:
    """Request schema for create operations - Technical unit being part of a controllable unit.

    Attributes:
        controllable_unit_id (int): Reference to the controllable unit that this technical resource belongs to. Example:
            37.
        name (Union[Unset, str]): Name of the technical resource. Maximum 128 characters. Example: Battery Unit #1.
        details (Union[None, Unset, str]): Free text details about the technical resource. Example: Make: ACME
            Model: Car Charger 3000.
    """

    controllable_unit_id: int
    name: Union[Unset, str] = UNSET
    details: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        controllable_unit_id = self.controllable_unit_id

        name = self.name

        details: Union[None, Unset, str]
        if isinstance(self.details, Unset):
            details = UNSET
        else:
            details = self.details

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "controllable_unit_id": controllable_unit_id,
            }
        )
        if name is not UNSET:
            field_dict["name"] = name
        if details is not UNSET:
            field_dict["details"] = details

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        controllable_unit_id = d.pop("controllable_unit_id")

        name = d.pop("name", UNSET)

        def _parse_details(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        details = _parse_details(d.pop("details", UNSET))

        technical_resource_create_request = cls(
            controllable_unit_id=controllable_unit_id,
            name=name,
            details=details,
        )

        technical_resource_create_request.additional_properties = d
        return technical_resource_create_request

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
