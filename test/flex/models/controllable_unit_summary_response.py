from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.controllable_unit_summary_response_aggregates import ControllableUnitSummaryResponseAggregates


T = TypeVar("T", bound="ControllableUnitSummaryResponse")


@_attrs_define
class ControllableUnitSummaryResponse:
    """Response schema - Aggregated summary of technical resources belonging to a controllable unit.

    Attributes:
        id (int): The ID of the controllable unit this resource is a summary of. Example: 12.
        aggregates (ControllableUnitSummaryResponseAggregates): Aggregated statistics on technical resources belonging
            to the controllable unit, including counts and maximum active power breakdowns (sum, average, min, max) by
            category and technology. Example: {'technical_resource': {'count': 3, 'maximum_active_power': {'sum': 150,
            'average': 50, 'min': 20, 'max': 80}, 'by_category': {'production': {'count': 2, 'maximum_active_power': {'sum':
            130, 'average': 65, 'min': 50, 'max': 80}}, 'consumption': {'count': 1, 'maximum_active_power': {'sum': 20,
            'average': 20, 'min': 20, 'max': 20}}}, 'by_technology': {'solar': {'count': 2, 'maximum_active_power': {'sum':
            130, 'average': 65, 'min': 50, 'max': 80}}, 'battery': {'count': 1, 'maximum_active_power': {'sum': 20,
            'average': 20, 'min': 20, 'max': 20}}}}}.
    """

    id: int
    aggregates: ControllableUnitSummaryResponseAggregates
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        aggregates = self.aggregates.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "aggregates": aggregates,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_summary_response_aggregates import ControllableUnitSummaryResponseAggregates

        d = dict(src_dict)
        id = d.pop("id")

        aggregates = ControllableUnitSummaryResponseAggregates.from_dict(d.pop("aggregates"))

        controllable_unit_summary_response = cls(
            id=id,
            aggregates=aggregates,
        )

        controllable_unit_summary_response.additional_properties = d
        return controllable_unit_summary_response

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
