from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_summary_response_technical_resource_by_category import (
        ControllableUnitSummaryResponseTechnicalResourceByCategory,
    )
    from ..models.controllable_unit_summary_response_technical_resource_by_technology import (
        ControllableUnitSummaryResponseTechnicalResourceByTechnology,
    )
    from ..models.numeric_aggregation import NumericAggregation


T = TypeVar("T", bound="ControllableUnitSummaryResponseTechnicalResource")


@_attrs_define
class ControllableUnitSummaryResponseTechnicalResource:
    """Aggregated statistics on technical resources belonging to the controllable unit, including counts and maximum active
    power breakdowns (sum, average, min, max) by category and technology.

        Example:
            {'technical_resource': {'count': 3, 'maximum_active_power': {'sum': 150, 'average': 50, 'min': 20, 'max': 80},
                'by_category': {'production': {'count': 2, 'maximum_active_power': {'sum': 130, 'average': 65, 'min': 50, 'max':
                80}}, 'consumption': {'count': 1, 'maximum_active_power': {'sum': 20, 'average': 20, 'min': 20, 'max': 20}}},
                'by_technology': {'solar': {'count': 2, 'maximum_active_power': {'sum': 130, 'average': 65, 'min': 50, 'max':
                80}}, 'battery': {'count': 1, 'maximum_active_power': {'sum': 20, 'average': 20, 'min': 20, 'max': 20}}}}}

        Attributes:
            count (int | Unset):
            maximum_active_power (NumericAggregation | Unset):
            by_category (ControllableUnitSummaryResponseTechnicalResourceByCategory | Unset):
            by_technology (ControllableUnitSummaryResponseTechnicalResourceByTechnology | Unset):
    """

    count: int | Unset = UNSET
    maximum_active_power: NumericAggregation | Unset = UNSET
    by_category: ControllableUnitSummaryResponseTechnicalResourceByCategory | Unset = UNSET
    by_technology: ControllableUnitSummaryResponseTechnicalResourceByTechnology | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        count = self.count

        maximum_active_power: dict[str, Any] | Unset = UNSET
        if not isinstance(self.maximum_active_power, Unset):
            maximum_active_power = self.maximum_active_power.to_dict()

        by_category: dict[str, Any] | Unset = UNSET
        if not isinstance(self.by_category, Unset):
            by_category = self.by_category.to_dict()

        by_technology: dict[str, Any] | Unset = UNSET
        if not isinstance(self.by_technology, Unset):
            by_technology = self.by_technology.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if count is not UNSET:
            field_dict["count"] = count
        if maximum_active_power is not UNSET:
            field_dict["maximum_active_power"] = maximum_active_power
        if by_category is not UNSET:
            field_dict["by_category"] = by_category
        if by_technology is not UNSET:
            field_dict["by_technology"] = by_technology

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_summary_response_technical_resource_by_category import (
            ControllableUnitSummaryResponseTechnicalResourceByCategory,
        )
        from ..models.controllable_unit_summary_response_technical_resource_by_technology import (
            ControllableUnitSummaryResponseTechnicalResourceByTechnology,
        )
        from ..models.numeric_aggregation import NumericAggregation

        d = dict(src_dict)
        count = d.pop("count", UNSET)

        _maximum_active_power = d.pop("maximum_active_power", UNSET)
        maximum_active_power: NumericAggregation | Unset
        if isinstance(_maximum_active_power, Unset):
            maximum_active_power = UNSET
        else:
            maximum_active_power = NumericAggregation.from_dict(_maximum_active_power)

        _by_category = d.pop("by_category", UNSET)
        by_category: ControllableUnitSummaryResponseTechnicalResourceByCategory | Unset
        if isinstance(_by_category, Unset):
            by_category = UNSET
        else:
            by_category = ControllableUnitSummaryResponseTechnicalResourceByCategory.from_dict(_by_category)

        _by_technology = d.pop("by_technology", UNSET)
        by_technology: ControllableUnitSummaryResponseTechnicalResourceByTechnology | Unset
        if isinstance(_by_technology, Unset):
            by_technology = UNSET
        else:
            by_technology = ControllableUnitSummaryResponseTechnicalResourceByTechnology.from_dict(_by_technology)

        controllable_unit_summary_response_technical_resource = cls(
            count=count,
            maximum_active_power=maximum_active_power,
            by_category=by_category,
            by_technology=by_technology,
        )

        controllable_unit_summary_response_technical_resource.additional_properties = d
        return controllable_unit_summary_response_technical_resource

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
