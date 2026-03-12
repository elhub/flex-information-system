from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.device_type import DeviceType
from ..models.technical_resource_business_id_type import TechnicalResourceBusinessIdType
from ..models.technology import Technology
from ..types import UNSET, Unset

T = TypeVar("T", bound="TechnicalResourceCreateRequest")


@_attrs_define
class TechnicalResourceCreateRequest:
    """Request schema for create operations - Technical unit being part of a controllable unit.

    Attributes:
        name (str): Name of the technical resource. Maximum 128 characters. Example: Battery Unit #1.
        controllable_unit_id (int): Reference to the controllable unit that this technical resource belongs to. Example:
            37.
        technology (list[Technology]): Technologies of the technical resource using ltree path notation. Multiple
            technologies can be specified for hybrid resources (e.g., solar + battery). Example: ['solar', 'battery'].
        maximum_active_power (float): Maximum continuous active power (rated power) of the technical resource in
            kilowatts. Example: 120.0.
        device_type (DeviceType): Type of device for technical resources.
        make (None | str | Unset): The manufacturer of the device. Required if model or business_id is provided.
            Example: SolarEdge.
        model (None | str | Unset): The model of the device. Example: SE10K-RWS.
        business_id (None | str | Unset): Business identifier of the device, such as a serial number or MAC address.
            Example: SE10K123456789.
        business_id_type (TechnicalResourceBusinessIdType | Unset): The type of business identifier used for the device.
            Example: serial_number.
        additional_information (None | str | Unset): Free text field for extra information about the technical resource
            if needed.
    """

    name: str
    controllable_unit_id: int
    technology: list[Technology]
    maximum_active_power: float
    device_type: DeviceType
    make: None | str | Unset = UNSET
    model: None | str | Unset = UNSET
    business_id: None | str | Unset = UNSET
    business_id_type: TechnicalResourceBusinessIdType | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        controllable_unit_id = self.controllable_unit_id

        technology = []
        for technology_item_data in self.technology:
            technology_item = technology_item_data.value
            technology.append(technology_item)

        maximum_active_power = self.maximum_active_power

        device_type = self.device_type.value

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

        business_id_type: str | Unset = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "name": name,
                "controllable_unit_id": controllable_unit_id,
                "technology": technology,
                "maximum_active_power": maximum_active_power,
                "device_type": device_type,
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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name")

        controllable_unit_id = d.pop("controllable_unit_id")

        technology = []
        _technology = d.pop("technology")
        for technology_item_data in _technology:
            technology_item = Technology(technology_item_data)

            technology.append(technology_item)

        maximum_active_power = d.pop("maximum_active_power")

        device_type = DeviceType(d.pop("device_type"))

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

        _business_id_type = d.pop("business_id_type", UNSET)
        business_id_type: TechnicalResourceBusinessIdType | Unset
        if isinstance(_business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = TechnicalResourceBusinessIdType(_business_id_type)

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        technical_resource_create_request = cls(
            name=name,
            controllable_unit_id=controllable_unit_id,
            technology=technology,
            maximum_active_power=maximum_active_power,
            device_type=device_type,
            make=make,
            model=model,
            business_id=business_id,
            business_id_type=business_id_type,
            additional_information=additional_information,
        )

        technical_resource_create_request.additional_properties = d
        return technical_resource_create_request

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
