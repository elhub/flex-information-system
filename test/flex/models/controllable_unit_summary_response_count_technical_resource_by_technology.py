from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="ControllableUnitSummaryResponseCountTechnicalResourceByTechnology")


@_attrs_define
class ControllableUnitSummaryResponseCountTechnicalResourceByTechnology:
    """Number of technical resources in the controllable unit, broken down by technology. Keys are technology IDs, values
    are counts.

        Example:
            {'solar': 2, 'battery': 1}

    """

    additional_properties: dict[str, int] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        controllable_unit_summary_response_count_technical_resource_by_technology = cls()

        controllable_unit_summary_response_count_technical_resource_by_technology.additional_properties = d
        return controllable_unit_summary_response_count_technical_resource_by_technology

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> int:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: int) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
