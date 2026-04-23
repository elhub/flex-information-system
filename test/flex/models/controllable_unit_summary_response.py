from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_response import ControllableUnitResponse
    from ..models.controllable_unit_summary_response_technical_resource import (
        ControllableUnitSummaryResponseTechnicalResource,
    )


T = TypeVar("T", bound="ControllableUnitSummaryResponse")


@_attrs_define
class ControllableUnitSummaryResponse:
    """Response schema - Aggregated summary of technical resources belonging to a controllable unit.

    Attributes:
        id (int): Unique surrogate key. Example: 12.
        controllable_unit_id (int): The ID of the controllable unit this resource is a summary of. Example: 12.
        technical_resource (ControllableUnitSummaryResponseTechnicalResource): Aggregated statistics on technical
            resources belonging to the controllable unit, including counts and maximum active power breakdowns (sum,
            average, min, max) by category and technology. Example: {'technical_resource': {'count': 3,
            'maximum_active_power': {'sum': 150, 'average': 50, 'min': 20, 'max': 80}, 'by_category': {'production':
            {'count': 2, 'maximum_active_power': {'sum': 130, 'average': 65, 'min': 50, 'max': 80}}, 'consumption':
            {'count': 1, 'maximum_active_power': {'sum': 20, 'average': 20, 'min': 20, 'max': 20}}}, 'by_technology':
            {'solar': {'count': 2, 'maximum_active_power': {'sum': 130, 'average': 65, 'min': 50, 'max': 80}}, 'battery':
            {'count': 1, 'maximum_active_power': {'sum': 20, 'average': 20, 'min': 20, 'max': 20}}}}}.
        controllable_unit (ControllableUnitResponse | None | Unset): Embedded controllable_unit
    """

    id: int
    controllable_unit_id: int
    technical_resource: ControllableUnitSummaryResponseTechnicalResource
    controllable_unit: ControllableUnitResponse | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.controllable_unit_response import ControllableUnitResponse

        id = self.id

        controllable_unit_id = self.controllable_unit_id

        technical_resource = self.technical_resource.to_dict()

        controllable_unit: dict[str, Any] | None | Unset
        if isinstance(self.controllable_unit, Unset):
            controllable_unit = UNSET
        elif isinstance(self.controllable_unit, ControllableUnitResponse):
            controllable_unit = self.controllable_unit.to_dict()
        else:
            controllable_unit = self.controllable_unit

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "controllable_unit_id": controllable_unit_id,
                "technical_resource": technical_resource,
            }
        )
        if controllable_unit is not UNSET:
            field_dict["controllable_unit"] = controllable_unit

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.controllable_unit_summary_response_technical_resource import (
            ControllableUnitSummaryResponseTechnicalResource,
        )

        d = dict(src_dict)
        id = d.pop("id")

        controllable_unit_id = d.pop("controllable_unit_id")

        technical_resource = ControllableUnitSummaryResponseTechnicalResource.from_dict(d.pop("technical_resource"))

        def _parse_controllable_unit(data: object) -> ControllableUnitResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                controllable_unit_type_0 = ControllableUnitResponse.from_dict(data)

                return controllable_unit_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ControllableUnitResponse | None | Unset, data)

        controllable_unit = _parse_controllable_unit(d.pop("controllable_unit", UNSET))

        controllable_unit_summary_response = cls(
            id=id,
            controllable_unit_id=controllable_unit_id,
            technical_resource=technical_resource,
            controllable_unit=controllable_unit,
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
