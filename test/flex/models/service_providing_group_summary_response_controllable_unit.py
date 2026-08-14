from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.numeric_aggregation import NumericAggregation


T = TypeVar("T", bound="ServiceProvidingGroupSummaryResponseControllableUnit")


@_attrs_define
class ServiceProvidingGroupSummaryResponseControllableUnit:
    """Aggregated statistics on controllable units currently in the service providing group, including count, maximum
    active power information (sum, average, min, max), and flexible power breakdowns total, up and down (sum, average,
    min, max).

        Example:
            {'count': 3, 'maximum_active_power': {'sum': 250, 'average': 83.33, 'min': 50, 'max': 120}, 'flexible_power':
                {'sum': 200, 'average': 66.67, 'min': 40, 'max': 100}, 'flexible_power_up': {'sum': 150, 'average': 75, 'min':
                50, 'max': 100}, 'flexible_power_down': {'sum': 100, 'average': 50, 'min': 40, 'max': 60}}

        Attributes:
            count (int | Unset):
            maximum_active_power (NumericAggregation | Unset):
            flexible_power (NumericAggregation | Unset):
            flexible_power_up (NumericAggregation | Unset):
            flexible_power_down (NumericAggregation | Unset):
    """

    count: int | Unset = UNSET
    maximum_active_power: NumericAggregation | Unset = UNSET
    flexible_power: NumericAggregation | Unset = UNSET
    flexible_power_up: NumericAggregation | Unset = UNSET
    flexible_power_down: NumericAggregation | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        count = self.count

        maximum_active_power: dict[str, Any] | Unset = UNSET
        if not isinstance(self.maximum_active_power, Unset):
            maximum_active_power = self.maximum_active_power.to_dict()

        flexible_power: dict[str, Any] | Unset = UNSET
        if not isinstance(self.flexible_power, Unset):
            flexible_power = self.flexible_power.to_dict()

        flexible_power_up: dict[str, Any] | Unset = UNSET
        if not isinstance(self.flexible_power_up, Unset):
            flexible_power_up = self.flexible_power_up.to_dict()

        flexible_power_down: dict[str, Any] | Unset = UNSET
        if not isinstance(self.flexible_power_down, Unset):
            flexible_power_down = self.flexible_power_down.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if count is not UNSET:
            field_dict["count"] = count
        if maximum_active_power is not UNSET:
            field_dict["maximum_active_power"] = maximum_active_power
        if flexible_power is not UNSET:
            field_dict["flexible_power"] = flexible_power
        if flexible_power_up is not UNSET:
            field_dict["flexible_power_up"] = flexible_power_up
        if flexible_power_down is not UNSET:
            field_dict["flexible_power_down"] = flexible_power_down

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.numeric_aggregation import NumericAggregation

        d = dict(src_dict)
        count = d.pop("count", UNSET)

        _maximum_active_power = d.pop("maximum_active_power", UNSET)
        maximum_active_power: NumericAggregation | Unset
        if isinstance(_maximum_active_power, Unset):
            maximum_active_power = UNSET
        else:
            maximum_active_power = NumericAggregation.from_dict(_maximum_active_power)

        _flexible_power = d.pop("flexible_power", UNSET)
        flexible_power: NumericAggregation | Unset
        if isinstance(_flexible_power, Unset):
            flexible_power = UNSET
        else:
            flexible_power = NumericAggregation.from_dict(_flexible_power)

        _flexible_power_up = d.pop("flexible_power_up", UNSET)
        flexible_power_up: NumericAggregation | Unset
        if isinstance(_flexible_power_up, Unset):
            flexible_power_up = UNSET
        else:
            flexible_power_up = NumericAggregation.from_dict(_flexible_power_up)

        _flexible_power_down = d.pop("flexible_power_down", UNSET)
        flexible_power_down: NumericAggregation | Unset
        if isinstance(_flexible_power_down, Unset):
            flexible_power_down = UNSET
        else:
            flexible_power_down = NumericAggregation.from_dict(_flexible_power_down)

        service_providing_group_summary_response_controllable_unit = cls(
            count=count,
            maximum_active_power=maximum_active_power,
            flexible_power=flexible_power,
            flexible_power_up=flexible_power_up,
            flexible_power_down=flexible_power_down,
        )

        service_providing_group_summary_response_controllable_unit.additional_properties = d
        return service_providing_group_summary_response_controllable_unit

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
