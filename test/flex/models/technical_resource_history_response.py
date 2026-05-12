from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.category import Category
from ..models.device_type import DeviceType
from ..models.technical_resource_business_id_type import TechnicalResourceBusinessIdType
from ..models.technology import Technology
from ..types import UNSET, Unset

T = TypeVar("T", bound="TechnicalResourceHistoryResponse")


@_attrs_define
class TechnicalResourceHistoryResponse:
    """Technical Resource - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        name (str): Name of the technical resource. Maximum 128 characters. Example: Battery Unit #1.
        controllable_unit_id (int): Reference to the controllable unit that this technical resource belongs to. Example:
            37.
        technology (list[Technology]): Technologies of the technical resource using ltree path notation. Multiple
            technologies can be specified for hybrid resources (e.g., solar + battery). Example: ['solar', 'battery'].
        category (list[Category]): Categories derived from the technologies of the technical resource. Automatically
            computed based on the selected technologies. Example: ['production', 'energy_storage'].
        maximum_active_power (float): Maximum continuous active power (rated power) of the technical resource in
            kilowatts. Example: 120.0.
        device_type (DeviceType): Type of device for technical resources.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        technical_resource_id (int): Reference to the resource that was updated. Example: 48.
        make (None | str | Unset): The manufacturer of the device. Required if model or business_id is provided.
            Example: SolarEdge.
        model (None | str | Unset): The model of the device. Example: SE10K-RWS.
        business_id (None | str | Unset): Business identifier of the device, such as a serial number or MAC address.
            Example: SE10K123456789.
        business_id_type (None | TechnicalResourceBusinessIdType | Unset):
        additional_information (None | str | Unset): Free text field for extra information about the technical resource
            if needed.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    name: str
    controllable_unit_id: int
    technology: list[Technology]
    category: list[Category]
    maximum_active_power: float
    device_type: DeviceType
    recorded_at: datetime.datetime
    recorded_by: int
    technical_resource_id: int
    make: None | str | Unset = UNSET
    model: None | str | Unset = UNSET
    business_id: None | str | Unset = UNSET
    business_id_type: None | TechnicalResourceBusinessIdType | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        controllable_unit_id = self.controllable_unit_id

        technology = []
        for technology_item_data in self.technology:
            technology_item = technology_item_data.value
            technology.append(technology_item)

        category = []
        for category_item_data in self.category:
            category_item = category_item_data.value
            category.append(category_item)

        maximum_active_power = self.maximum_active_power

        device_type = self.device_type.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        technical_resource_id = self.technical_resource_id

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

        business_id: None | str | Unset
        if isinstance(self.business_id, Unset):
            business_id = UNSET
        else:
            business_id = self.business_id

        business_id_type: None | str | Unset
        if isinstance(self.business_id_type, Unset):
            business_id_type = UNSET
        elif isinstance(self.business_id_type, TechnicalResourceBusinessIdType):
            business_id_type = self.business_id_type.value
        else:
            business_id_type = self.business_id_type

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        elif isinstance(self.replaced_at, datetime.datetime):
            replaced_at = self.replaced_at.isoformat()
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "name": name,
                "controllable_unit_id": controllable_unit_id,
                "technology": technology,
                "category": category,
                "maximum_active_power": maximum_active_power,
                "device_type": device_type,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "technical_resource_id": technical_resource_id,
            }
        )
        if make is not UNSET:
            field_dict["make"] = make
        if model is not UNSET:
            field_dict["model"] = model
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        controllable_unit_id = d.pop("controllable_unit_id")

        technology = []
        _technology = d.pop("technology")
        for technology_item_data in _technology:
            technology_item = Technology(technology_item_data)

            technology.append(technology_item)

        category = []
        _category = d.pop("category")
        for category_item_data in _category:
            category_item = Category(category_item_data)

            category.append(category_item)

        maximum_active_power = d.pop("maximum_active_power")

        device_type = DeviceType(d.pop("device_type"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        technical_resource_id = d.pop("technical_resource_id")

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

        def _parse_business_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        business_id = _parse_business_id(d.pop("business_id", UNSET))

        def _parse_business_id_type(data: object) -> None | TechnicalResourceBusinessIdType | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                business_id_type_type_0 = TechnicalResourceBusinessIdType(data)

                return business_id_type_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | TechnicalResourceBusinessIdType | Unset, data)

        business_id_type = _parse_business_id_type(d.pop("business_id_type", UNSET))

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                replaced_at_type_0 = isoparse(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        technical_resource_history_response = cls(
            id=id,
            name=name,
            controllable_unit_id=controllable_unit_id,
            technology=technology,
            category=category,
            maximum_active_power=maximum_active_power,
            device_type=device_type,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            technical_resource_id=technical_resource_id,
            make=make,
            model=model,
            business_id=business_id,
            business_id_type=business_id_type,
            additional_information=additional_information,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        technical_resource_history_response.additional_properties = d
        return technical_resource_history_response

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
