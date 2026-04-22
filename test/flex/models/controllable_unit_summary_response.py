from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.controllable_unit_summary_response_count_technical_resource_by_technology import (
        ControllableUnitSummaryResponseCountTechnicalResourceByTechnology,
    )


T = TypeVar("T", bound="ControllableUnitSummaryResponse")


@_attrs_define
class ControllableUnitSummaryResponse:
    """Response schema - Aggregated summary of technical resources belonging to a controllable unit.

    Attributes:
        id (int): The ID of the controllable unit this resource is a summary of. Example: 12.
        count_technical_resource (int): Total number of technical resources in the controllable unit. Example: 3.
        count_technical_resource_by_technology (ControllableUnitSummaryResponseCountTechnicalResourceByTechnology):
            Number of technical resources in the controllable unit, broken down by technology. Keys are technology IDs,
            values are counts. Example: {'solar': 2, 'battery': 1}.
        sum_maximum_active_power (float): Sum of maximum active power of all technical resources in the controllable
            unit. Example: 150.0.
        sum_maximum_active_power_production (float): Sum of maximum active power of all production technical resources
            in the controllable unit. Example: 150.0.
        sum_maximum_active_power_consumption (float): Sum of maximum active power of all consumption technical resources
            in the controllable unit. Example: 150.0.
        sum_maximum_active_power_energy_storage (float): Sum of maximum active power of all energy storage technical
            resources in the controllable unit. Example: 150.0.
        average_maximum_active_power (float): Average maximum active power across all technical resources in the
            controllable unit. Example: 50.0.
    """

    id: int
    count_technical_resource: int
    count_technical_resource_by_technology: ControllableUnitSummaryResponseCountTechnicalResourceByTechnology
    sum_maximum_active_power: float
    sum_maximum_active_power_production: float
    sum_maximum_active_power_consumption: float
    sum_maximum_active_power_energy_storage: float
    average_maximum_active_power: float
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        count_technical_resource = self.count_technical_resource

        count_technical_resource_by_technology = self.count_technical_resource_by_technology.to_dict()

        sum_maximum_active_power = self.sum_maximum_active_power

        sum_maximum_active_power_production = self.sum_maximum_active_power_production

        sum_maximum_active_power_consumption = self.sum_maximum_active_power_consumption

        sum_maximum_active_power_energy_storage = self.sum_maximum_active_power_energy_storage

        average_maximum_active_power = self.average_maximum_active_power

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "count_technical_resource": count_technical_resource,
                "count_technical_resource_by_technology": count_technical_resource_by_technology,
                "sum_maximum_active_power": sum_maximum_active_power,
                "sum_maximum_active_power_production": sum_maximum_active_power_production,
                "sum_maximum_active_power_consumption": sum_maximum_active_power_consumption,
                "sum_maximum_active_power_energy_storage": sum_maximum_active_power_energy_storage,
                "average_maximum_active_power": average_maximum_active_power,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_summary_response_count_technical_resource_by_technology import (
            ControllableUnitSummaryResponseCountTechnicalResourceByTechnology,
        )

        d = dict(src_dict)
        id = d.pop("id")

        count_technical_resource = d.pop("count_technical_resource")

        count_technical_resource_by_technology = (
            ControllableUnitSummaryResponseCountTechnicalResourceByTechnology.from_dict(
                d.pop("count_technical_resource_by_technology")
            )
        )

        sum_maximum_active_power = d.pop("sum_maximum_active_power")

        sum_maximum_active_power_production = d.pop("sum_maximum_active_power_production")

        sum_maximum_active_power_consumption = d.pop("sum_maximum_active_power_consumption")

        sum_maximum_active_power_energy_storage = d.pop("sum_maximum_active_power_energy_storage")

        average_maximum_active_power = d.pop("average_maximum_active_power")

        controllable_unit_summary_response = cls(
            id=id,
            count_technical_resource=count_technical_resource,
            count_technical_resource_by_technology=count_technical_resource_by_technology,
            sum_maximum_active_power=sum_maximum_active_power,
            sum_maximum_active_power_production=sum_maximum_active_power_production,
            sum_maximum_active_power_consumption=sum_maximum_active_power_consumption,
            sum_maximum_active_power_energy_storage=sum_maximum_active_power_energy_storage,
            average_maximum_active_power=average_maximum_active_power,
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
