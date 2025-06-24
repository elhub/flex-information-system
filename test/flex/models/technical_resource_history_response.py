from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="TechnicalResourceHistoryResponse")


@_attrs_define
class TechnicalResourceHistoryResponse:
    """Technical Resource - history

    Attributes:
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        technical_resource_id (int): Reference to the resource that was updated. Example: 48.
        name (Union[Unset, str]): Name of the technical resource. Maximum 128 characters. Example: Battery Unit #1.
        details (Union[None, Unset, str]): Free text details about the technical resource. Example: Make: ACME
            Model: Car Charger 3000.
        controllable_unit_id (Union[Unset, int]): Reference to the controllable unit that this technical resource
            belongs to. Example: 37.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    recorded_at: str
    recorded_by: int
    technical_resource_id: int
    name: Union[Unset, str] = UNSET
    details: Union[None, Unset, str] = UNSET
    controllable_unit_id: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        technical_resource_id = self.technical_resource_id

        name = self.name

        details: Union[None, Unset, str]
        if isinstance(self.details, Unset):
            details = UNSET
        else:
            details = self.details

        controllable_unit_id = self.controllable_unit_id

        id = self.id

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
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "technical_resource_id": technical_resource_id,
            }
        )
        if name is not UNSET:
            field_dict["name"] = name
        if details is not UNSET:
            field_dict["details"] = details
        if controllable_unit_id is not UNSET:
            field_dict["controllable_unit_id"] = controllable_unit_id
        if id is not UNSET:
            field_dict["id"] = id
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        technical_resource_id = d.pop("technical_resource_id")

        name = d.pop("name", UNSET)

        def _parse_details(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        details = _parse_details(d.pop("details", UNSET))

        controllable_unit_id = d.pop("controllable_unit_id", UNSET)

        id = d.pop("id", UNSET)

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

        technical_resource_history_response = cls(
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            technical_resource_id=technical_resource_id,
            name=name,
            details=details,
            controllable_unit_id=controllable_unit_id,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        technical_resource_history_response.additional_properties = d
        return technical_resource_history_response

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
