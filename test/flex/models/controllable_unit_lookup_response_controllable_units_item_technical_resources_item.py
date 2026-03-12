from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.category import Category
from ..models.device_type import DeviceType
from ..models.technology import Technology
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitLookupResponseControllableUnitsItemTechnicalResourcesItem")


@_attrs_define
class ControllableUnitLookupResponseControllableUnitsItemTechnicalResourcesItem:
    """
    Attributes:
        id (int): The surrogate key of the technical resource. Example: 17.
        name (str): The name of the technical resource. Example: Battery Unit A.
        technologies (list[Technology]): Technologies of the technical resource. Example: ['solar', 'battery'].
        categories (list[Category]): Categories derived from the technologies. Example: ['production',
            'energy_storage'].
        maximum_active_power (float): Maximum continuous active power of the technical resource in kilowatts. Example:
            120.0.
        device_type (DeviceType | None | Unset): The type of device. Example: inverter.
        make (None | str | Unset): The manufacturer of the device. Example: SolarEdge.
        model (None | str | Unset): The model of the device. Example: SE10K-RWS.
        device_unique_identifier (None | str | Unset): Unique identifier of the device. Example: SE10K123456789.
    """

    id: int
    name: str
    technologies: list[Technology]
    categories: list[Category]
    maximum_active_power: float
    device_type: DeviceType | None | Unset = UNSET
    make: None | str | Unset = UNSET
    model: None | str | Unset = UNSET
    device_unique_identifier: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        technologies = []
        for technologies_item_data in self.technologies:
            technologies_item = technologies_item_data.value
            technologies.append(technologies_item)

        categories = []
        for categories_item_data in self.categories:
            categories_item = categories_item_data.value
            categories.append(categories_item)

        maximum_active_power = self.maximum_active_power

        device_type: None | str | Unset
        if isinstance(self.device_type, Unset):
            device_type = UNSET
        elif isinstance(self.device_type, DeviceType):
            device_type = self.device_type.value
        else:
            device_type = self.device_type

        make: None | str | Unset
        if isinstance(self.make, Unset):
            make = UNSET
        else:
            make = self.make

        model: None | str | Unset
        if isinstance(self.model, Unset):
            model = UNSET
        else:
            model = self.model

        device_unique_identifier: None | str | Unset
        if isinstance(self.device_unique_identifier, Unset):
            device_unique_identifier = UNSET
        else:
            device_unique_identifier = self.device_unique_identifier

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "name": name,
                "technologies": technologies,
                "categories": categories,
                "maximum_active_power": maximum_active_power,
            }
        )
        if device_type is not UNSET:
            field_dict["device_type"] = device_type
        if make is not UNSET:
            field_dict["make"] = make
        if model is not UNSET:
            field_dict["model"] = model
        if device_unique_identifier is not UNSET:
            field_dict["device_unique_identifier"] = device_unique_identifier

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        technologies = []
        _technologies = d.pop("technologies")
        for technologies_item_data in _technologies:
            technologies_item = Technology(technologies_item_data)

            technologies.append(technologies_item)

        categories = []
        _categories = d.pop("categories")
        for categories_item_data in _categories:
            categories_item = Category(categories_item_data)

            categories.append(categories_item)

        maximum_active_power = d.pop("maximum_active_power")

        def _parse_device_type(data: object) -> DeviceType | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                device_type_type_1 = DeviceType(data)

                return device_type_type_1
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(DeviceType | None | Unset, data)

        device_type = _parse_device_type(d.pop("device_type", UNSET))

        def _parse_make(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        make = _parse_make(d.pop("make", UNSET))

        def _parse_model(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        model = _parse_model(d.pop("model", UNSET))

        def _parse_device_unique_identifier(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        device_unique_identifier = _parse_device_unique_identifier(d.pop("device_unique_identifier", UNSET))

        controllable_unit_lookup_response_controllable_units_item_technical_resources_item = cls(
            id=id,
            name=name,
            technologies=technologies,
            categories=categories,
            maximum_active_power=maximum_active_power,
            device_type=device_type,
            make=make,
            model=model,
            device_unique_identifier=device_unique_identifier,
        )

        controllable_unit_lookup_response_controllable_units_item_technical_resources_item.additional_properties = d
        return controllable_unit_lookup_response_controllable_units_item_technical_resources_item

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
