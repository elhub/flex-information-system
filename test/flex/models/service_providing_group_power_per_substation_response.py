from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_power_per_substation_response_substations_item import (
        ServiceProvidingGroupPowerPerSubstationResponseSubstationsItem,
    )
    from ..models.service_providing_group_response import ServiceProvidingGroupResponse


T = TypeVar("T", bound="ServiceProvidingGroupPowerPerSubstationResponse")


@_attrs_define
class ServiceProvidingGroupPowerPerSubstationResponse:
    """Response schema - Per-substation breakdown of controllable units and their technical details for a service providing
    group.

        Attributes:
            id (int): Unique surrogate key (service providing group ID). Example: 4.
            service_providing_group_id (int): The ID of the service providing group this resource is a breakdown of.
                Example: 4.
            substations (list[ServiceProvidingGroupPowerPerSubstationResponseSubstationsItem]): List of per-substation
                aggregates for the controllable units currently in the service providing group. Each element contains the
                substation identifier and name, plus count and maximum active power statistics for the controllable units
                connected to that substation. An element with null substation fields groups controllable units whose grid
                location has not yet been assigned. Example: [{'substation_business_id': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                'substation_name': 'Substation A', 'controllable_unit': {'count': 3, 'maximum_active_power': {'sum': 150,
                'average': 50, 'min': 30, 'max': 80}}}, {'substation_business_id': None, 'substation_name': None,
                'controllable_unit': {'count': 1, 'maximum_active_power': {'sum': 20, 'average': 20, 'min': 20, 'max': 20}}}].
            service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
    """

    id: int
    service_providing_group_id: int
    substations: list[ServiceProvidingGroupPowerPerSubstationResponseSubstationsItem]
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        id = self.id

        service_providing_group_id = self.service_providing_group_id

        substations = []
        for substations_item_data in self.substations:
            substations_item = substations_item_data.to_dict()
            substations.append(substations_item)

        service_providing_group: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group, Unset):
            service_providing_group = UNSET
        elif isinstance(self.service_providing_group, ServiceProvidingGroupResponse):
            service_providing_group = self.service_providing_group.to_dict()
        else:
            service_providing_group = self.service_providing_group

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "service_providing_group_id": service_providing_group_id,
                "substations": substations,
            }
        )
        if service_providing_group is not UNSET:
            field_dict["service_providing_group"] = service_providing_group

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_power_per_substation_response_substations_item import (
            ServiceProvidingGroupPowerPerSubstationResponseSubstationsItem,
        )
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_id = d.pop("service_providing_group_id")

        substations = []
        _substations = d.pop("substations")
        for substations_item_data in _substations:
            substations_item = ServiceProvidingGroupPowerPerSubstationResponseSubstationsItem.from_dict(
                substations_item_data
            )

            substations.append(substations_item)

        def _parse_service_providing_group(data: object) -> None | ServiceProvidingGroupResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_type_0 = ServiceProvidingGroupResponse.from_dict(data)

                return service_providing_group_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupResponse | Unset, data)

        service_providing_group = _parse_service_providing_group(d.pop("service_providing_group", UNSET))

        service_providing_group_power_per_substation_response = cls(
            id=id,
            service_providing_group_id=service_providing_group_id,
            substations=substations,
            service_providing_group=service_providing_group,
        )

        service_providing_group_power_per_substation_response.additional_properties = d
        return service_providing_group_power_per_substation_response

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
