from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_summary_response_aggregates_technical_resource import (
        ControllableUnitSummaryResponseAggregatesTechnicalResource,
    )


T = TypeVar("T", bound="ControllableUnitSummaryResponseAggregates")


@_attrs_define
class ControllableUnitSummaryResponseAggregates:
    """Aggregated statistics on technical resources belonging to the controllable unit, including counts and maximum active
    power breakdowns (sum, average, min, max) by category and technology.

        Example:
            {'technical_resource': {'count': 3, 'maximum_active_power': {'sum': 150, 'average': 50, 'min': 20, 'max': 80},
                'by_category': {'production': {'count': 2, 'maximum_active_power': {'sum': 130, 'average': 65, 'min': 50, 'max':
                80}}, 'consumption': {'count': 1, 'maximum_active_power': {'sum': 20, 'average': 20, 'min': 20, 'max': 20}}},
                'by_technology': {'solar': {'count': 2, 'maximum_active_power': {'sum': 130, 'average': 65, 'min': 50, 'max':
                80}}, 'battery': {'count': 1, 'maximum_active_power': {'sum': 20, 'average': 20, 'min': 20, 'max': 20}}}}}

        Attributes:
            technical_resource (ControllableUnitSummaryResponseAggregatesTechnicalResource | Unset):
    """

    technical_resource: ControllableUnitSummaryResponseAggregatesTechnicalResource | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        technical_resource: dict[str, Any] | Unset = UNSET
        if not isinstance(self.technical_resource, Unset):
            technical_resource = self.technical_resource.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if technical_resource is not UNSET:
            field_dict["technical_resource"] = technical_resource

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_summary_response_aggregates_technical_resource import (
            ControllableUnitSummaryResponseAggregatesTechnicalResource,
        )

        d = dict(src_dict)
        _technical_resource = d.pop("technical_resource", UNSET)
        technical_resource: ControllableUnitSummaryResponseAggregatesTechnicalResource | Unset
        if isinstance(_technical_resource, Unset):
            technical_resource = UNSET
        else:
            technical_resource = ControllableUnitSummaryResponseAggregatesTechnicalResource.from_dict(
                _technical_resource
            )

        controllable_unit_summary_response_aggregates = cls(
            technical_resource=technical_resource,
        )

        controllable_unit_summary_response_aggregates.additional_properties = d
        return controllable_unit_summary_response_aggregates

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
