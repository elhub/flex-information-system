from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.controllable_unit_lookup_response_controllable_units_item_technical_resources_item import (
        ControllableUnitLookupResponseControllableUnitsItemTechnicalResourcesItem,
    )


T = TypeVar("T", bound="ControllableUnitLookupResponseControllableUnitsItem")


@_attrs_define
class ControllableUnitLookupResponseControllableUnitsItem:
    """
    Attributes:
        id (int): The surrogate key of the controllable unit. Example: 11.
        business_id (str): The business ID of the controllable unit. Example: 53919b79-876f-4dad-8bde-b29368367604.
        name (str): The name of the controllable unit. Example: Car Charger #54.
        technical_resources (list['ControllableUnitLookupResponseControllableUnitsItemTechnicalResourcesItem']): The
            technical resources belonging to the controllable unit.
    """

    id: int
    business_id: str
    name: str
    technical_resources: list["ControllableUnitLookupResponseControllableUnitsItemTechnicalResourcesItem"]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        name = self.name

        technical_resources = []
        for technical_resources_item_data in self.technical_resources:
            technical_resources_item = technical_resources_item_data.to_dict()
            technical_resources.append(technical_resources_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "name": name,
                "technical_resources": technical_resources,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_lookup_response_controllable_units_item_technical_resources_item import (
            ControllableUnitLookupResponseControllableUnitsItemTechnicalResourcesItem,
        )

        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        name = d.pop("name")

        technical_resources = []
        _technical_resources = d.pop("technical_resources")
        for technical_resources_item_data in _technical_resources:
            technical_resources_item = (
                ControllableUnitLookupResponseControllableUnitsItemTechnicalResourcesItem.from_dict(
                    technical_resources_item_data
                )
            )

            technical_resources.append(technical_resources_item)

        controllable_unit_lookup_response_controllable_units_item = cls(
            id=id,
            business_id=business_id,
            name=name,
            technical_resources=technical_resources,
        )

        controllable_unit_lookup_response_controllable_units_item.additional_properties = d
        return controllable_unit_lookup_response_controllable_units_item

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
