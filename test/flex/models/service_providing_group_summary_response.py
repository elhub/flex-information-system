from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse
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
                units currently in the service providing group, including count and maximum active power information (sum,
                average, min, max). Example: {'count': 3, 'maximum_active_power': {'sum': 200, 'average': 66.67, 'min': 40,
                'max': 100}, 'maximum_active_power_up': {'sum': 150, 'average': 75, 'min': 50, 'max': 100},
                'maximum_active_power_down': {'sum': 100, 'average': 50, 'min': 40, 'max': 60}}.
            technical_resource (ServiceProvidingGroupSummaryResponseTechnicalResource): Aggregated statistics on technical
                resources belonging to controllable units with active membership in the service providing group, including
                counts and maximum active power breakdowns (sum, average, min, max) by category and technology. Example:
                {'count': 8, 'maximum_active_power': {'sum': 250, 'average': 31.25, 'min': 10, 'max': 80}, 'by_category':
                {'production': {'count': 5, 'maximum_active_power': {'sum': 180, 'average': 36, 'min': 10, 'max': 80}},
                'consumption': {'count': 3, 'maximum_active_power': {'sum': 70, 'average': 23.33, 'min': 15, 'max': 30}}},
                'by_technology': {'solar': {'count': 3, 'maximum_active_power': {'sum': 130, 'average': 43.33, 'min': 20, 'max':
                80}}, 'battery': {'count': 2, 'maximum_active_power': {'sum': 50, 'average': 25, 'min': 20, 'max': 30}}}}.
            service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
            service_providing_group_history (list[ServiceProvidingGroupHistoryResponse] | None | Unset): Embedded
                service_providing_group_history
    """

    id: int
    service_providing_group_id: int
    controllable_unit: ServiceProvidingGroupSummaryResponseControllableUnit
    technical_resource: ServiceProvidingGroupSummaryResponseTechnicalResource
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    service_providing_group_history: list[ServiceProvidingGroupHistoryResponse] | None | Unset = UNSET
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

        service_providing_group_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.service_providing_group_history, Unset):
            service_providing_group_history = UNSET
        elif isinstance(self.service_providing_group_history, list):
            service_providing_group_history = []
            for service_providing_group_history_type_0_item_data in self.service_providing_group_history:
                service_providing_group_history_type_0_item = service_providing_group_history_type_0_item_data.to_dict()
                service_providing_group_history.append(service_providing_group_history_type_0_item)

        else:
            service_providing_group_history = self.service_providing_group_history

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
        if service_providing_group_history is not UNSET:
            field_dict["service_providing_group_history"] = service_providing_group_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse
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

        def _parse_service_providing_group_history(
            data: object,
        ) -> list[ServiceProvidingGroupHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                service_providing_group_history_type_0 = []
                _service_providing_group_history_type_0 = data
                for service_providing_group_history_type_0_item_data in _service_providing_group_history_type_0:
                    service_providing_group_history_type_0_item = ServiceProvidingGroupHistoryResponse.from_dict(
                        service_providing_group_history_type_0_item_data
                    )

                    service_providing_group_history_type_0.append(service_providing_group_history_type_0_item)

                return service_providing_group_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupHistoryResponse] | None | Unset, data)

        service_providing_group_history = _parse_service_providing_group_history(
            d.pop("service_providing_group_history", UNSET)
        )

        service_providing_group_summary_response = cls(
            id=id,
            service_providing_group_id=service_providing_group_id,
            controllable_unit=controllable_unit,
            technical_resource=technical_resource,
            service_providing_group=service_providing_group,
            service_providing_group_history=service_providing_group_history,
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
