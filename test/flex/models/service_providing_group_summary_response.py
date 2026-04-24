from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_response import ServiceProvidingGroupResponse
    from ..models.service_providing_group_summary_response_controllable_unit import (
        ServiceProvidingGroupSummaryResponseControllableUnit,
    )
    from ..models.service_providing_group_summary_response_technical_resource import (
        ServiceProvidingGroupSummaryResponseTechnicalResource,
    )


T = TypeVar("T", bound="ServiceProvidingGroupSummaryResponse")


@_attrs_define
class ServiceProvidingGroupSummaryResponse:
    """Response schema - Aggregated summary of controllable units and technical resources belonging to a service providing
    group.

        Attributes:
            id (int): Unique surrogate key (service providing group ID). Example: 4.
            service_providing_group_id (int): The ID of the service providing group this resource is a summary of. Example:
                4.
            controllable_unit (ServiceProvidingGroupSummaryResponseControllableUnit): Aggregated statistics on controllable
                units currently in the service providing group, including count and maximum active power breakdowns (sum,
                average, min, max) by category and technology. Example: {'count': 3, 'maximum_active_power': {'sum': 250,
                'average': 83.33, 'min': 50, 'max': 120}}.
            technical_resource (ServiceProvidingGroupSummaryResponseTechnicalResource): Aggregated statistics on technical
                resources belonging to controllable units with active membership in the service providing group, including
                counts and maximum active power breakdowns (sum, average, min, max) by category and technology. Example:
                {'count': 8, 'maximum_active_power': {'sum': 250, 'average': 31.25, 'min': 10, 'max': 80}, 'by_category':
                {'production': {'count': 5, 'maximum_active_power': {'sum': 180, 'average': 36, 'min': 10, 'max': 80}},
                'consumption': {'count': 3, 'maximum_active_power': {'sum': 70, 'average': 23.33, 'min': 15, 'max': 30}}},
                'by_technology': {'solar': {'count': 3, 'maximum_active_power': {'sum': 130, 'average': 43.33, 'min': 20, 'max':
                80}}, 'battery': {'count': 2, 'maximum_active_power': {'sum': 50, 'average': 25, 'min': 20, 'max': 30}}}}.
            service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
    """

    id: int
    service_providing_group_id: int
    controllable_unit: ServiceProvidingGroupSummaryResponseControllableUnit
    technical_resource: ServiceProvidingGroupSummaryResponseTechnicalResource
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        id = self.id

        service_providing_group_id = self.service_providing_group_id

        controllable_unit = self.controllable_unit.to_dict()

        technical_resource = self.technical_resource.to_dict()

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
                "controllable_unit": controllable_unit,
                "technical_resource": technical_resource,
            }
        )
        if service_providing_group is not UNSET:
            field_dict["service_providing_group"] = service_providing_group

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse
        from ..models.service_providing_group_summary_response_controllable_unit import (
            ServiceProvidingGroupSummaryResponseControllableUnit,
        )
        from ..models.service_providing_group_summary_response_technical_resource import (
            ServiceProvidingGroupSummaryResponseTechnicalResource,
        )

        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_id = d.pop("service_providing_group_id")

        controllable_unit = ServiceProvidingGroupSummaryResponseControllableUnit.from_dict(d.pop("controllable_unit"))

        technical_resource = ServiceProvidingGroupSummaryResponseTechnicalResource.from_dict(
            d.pop("technical_resource")
        )

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

        service_providing_group_summary_response = cls(
            id=id,
            service_providing_group_id=service_providing_group_id,
            controllable_unit=controllable_unit,
            technical_resource=technical_resource,
            service_providing_group=service_providing_group,
        )

        service_providing_group_summary_response.additional_properties = d
        return service_providing_group_summary_response

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
