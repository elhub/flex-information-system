from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_power_per_substation_response_substations_item_controllable_unit import (
        ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemControllableUnit,
    )
    from ..models.service_providing_group_power_per_substation_response_substations_item_technical_resource import (
        ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemTechnicalResource,
    )


T = TypeVar("T", bound="ServiceProvidingGroupPowerPerSubstationResponseSubstationsItem")


@_attrs_define
class ServiceProvidingGroupPowerPerSubstationResponseSubstationsItem:
    """
    Attributes:
        substation_business_id (None | str | Unset):
        substation_name (None | str | Unset):
        controllable_unit (ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemControllableUnit | Unset):
        technical_resource (ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemTechnicalResource | Unset):
    """

    substation_business_id: None | str | Unset = UNSET
    substation_name: None | str | Unset = UNSET
    controllable_unit: ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemControllableUnit | Unset = UNSET
    technical_resource: ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemTechnicalResource | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        substation_business_id: None | str | Unset
        if isinstance(self.substation_business_id, Unset):
            substation_business_id = UNSET
        else:
            substation_business_id = self.substation_business_id

        substation_name: None | str | Unset
        if isinstance(self.substation_name, Unset):
            substation_name = UNSET
        else:
            substation_name = self.substation_name

        controllable_unit: dict[str, Any] | Unset = UNSET
        if not isinstance(self.controllable_unit, Unset):
            controllable_unit = self.controllable_unit.to_dict()

        technical_resource: dict[str, Any] | Unset = UNSET
        if not isinstance(self.technical_resource, Unset):
            technical_resource = self.technical_resource.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if substation_business_id is not UNSET:
            field_dict["substation_business_id"] = substation_business_id
        if substation_name is not UNSET:
            field_dict["substation_name"] = substation_name
        if controllable_unit is not UNSET:
            field_dict["controllable_unit"] = controllable_unit
        if technical_resource is not UNSET:
            field_dict["technical_resource"] = technical_resource

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_power_per_substation_response_substations_item_controllable_unit import (
            ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemControllableUnit,
        )
        from ..models.service_providing_group_power_per_substation_response_substations_item_technical_resource import (
            ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemTechnicalResource,
        )

        d = dict(src_dict)

        def _parse_substation_business_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        substation_business_id = _parse_substation_business_id(d.pop("substation_business_id", UNSET))

        def _parse_substation_name(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        substation_name = _parse_substation_name(d.pop("substation_name", UNSET))

        _controllable_unit = d.pop("controllable_unit", UNSET)
        controllable_unit: ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemControllableUnit | Unset
        if isinstance(_controllable_unit, Unset):
            controllable_unit = UNSET
        else:
            controllable_unit = (
                ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemControllableUnit.from_dict(
                    _controllable_unit
                )
            )

        _technical_resource = d.pop("technical_resource", UNSET)
        technical_resource: ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemTechnicalResource | Unset
        if isinstance(_technical_resource, Unset):
            technical_resource = UNSET
        else:
            technical_resource = (
                ServiceProvidingGroupPowerPerSubstationResponseSubstationsItemTechnicalResource.from_dict(
                    _technical_resource
                )
            )

        service_providing_group_power_per_substation_response_substations_item = cls(
            substation_business_id=substation_business_id,
            substation_name=substation_name,
            controllable_unit=controllable_unit,
            technical_resource=technical_resource,
        )

        service_providing_group_power_per_substation_response_substations_item.additional_properties = d
        return service_providing_group_power_per_substation_response_substations_item

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
