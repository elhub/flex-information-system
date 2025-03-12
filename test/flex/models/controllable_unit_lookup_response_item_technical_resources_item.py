from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitLookupResponseItemTechnicalResourcesItem")


@_attrs_define
class ControllableUnitLookupResponseItemTechnicalResourcesItem:
    """
    Attributes:
        id (int): The surrogate key of the technical resource. Example: 17.
        name (str): The name of the technical resource. Example: Battery Unit A.
        details (Union[Unset, str]): Additional details about the technical resource. Example: 16A.
    """

    id: int
    name: str
    details: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = self.id

        name = self.name

        details = self.details

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "name": name,
            }
        )
        if details is not UNSET:
            field_dict["details"] = details

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        id = d.pop("id")

        name = d.pop("name")

        details = d.pop("details", UNSET)

        controllable_unit_lookup_response_item_technical_resources_item = cls(
            id=id,
            name=name,
            details=details,
        )

        controllable_unit_lookup_response_item_technical_resources_item.additional_properties = d
        return controllable_unit_lookup_response_item_technical_resources_item

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
