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
    """Aggregated statistics on controllable units currently in the service providing group, including count and maximum
    active power information (sum, average, min, max).

        Example:
            {'count': 3, 'maximum_active_power': {'sum': 250, 'average': 83.33, 'min': 50, 'max': 120}}

        Attributes:
            count (int | Unset):
            maximum_active_power (NumericAggregation | Unset):
    """

    count: int | Unset = UNSET
    maximum_active_power: NumericAggregation | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        count = self.count

        maximum_active_power: dict[str, Any] | Unset = UNSET
        if not isinstance(self.maximum_active_power, Unset):
            maximum_active_power = self.maximum_active_power.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if count is not UNSET:
            field_dict["count"] = count
        if maximum_active_power is not UNSET:
            field_dict["maximum_active_power"] = maximum_active_power

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

        service_providing_group_summary_response_controllable_unit = cls(
            count=count,
            maximum_active_power=maximum_active_power,
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
