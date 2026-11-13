from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_grid_prequalification_response import (
        ServiceProvidingGroupGridPrequalificationResponse,
    )


T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationSubstationPowerResponse")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationSubstationPowerResponse:
    """Response schema - Flexible power per substation for a service providing group grid prequalification, together with
    the total approved flexible power of the substation across all approved grid prequalifications of the same impacted
    system operator.

        Attributes:
            service_providing_group_grid_prequalification_id (int): The ID of the service providing group grid
                prequalification. Example: 4.
            substation_business_id (str): Business ID of the substation. Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890.
            substation_name (str): Name of the substation. Example: Substation A.
            controllable_unit_count (int): Number of controllable units currently in the service providing group at the
                substation. Example: 3.
            maximum_active_power (float): Sum of the maximum active power of the controllable units currently in the service
                providing group at the substation, in kW. Example: 120.
            total_approved_maximum_active_power (float): Total approved flexible power at the substation, in kW. It is the
                sum of the maximum active power of the controllable units of all service providing groups with an approved or
                conditionally approved grid prequalification for the same impacted system operator, each controllable unit
                counted once. Controllable units added to a group after its approval are not included until the changes are
                approved. Controllable units without a substation are not included. Zero when nothing is approved. Example: 310.
            service_providing_group_grid_prequalification (None | ServiceProvidingGroupGridPrequalificationResponse |
                Unset): Embedded service_providing_group_grid_prequalification
    """

    service_providing_group_grid_prequalification_id: int
    substation_business_id: str
    substation_name: str
    controllable_unit_count: int
    maximum_active_power: float
    total_approved_maximum_active_power: float
    service_providing_group_grid_prequalification: None | ServiceProvidingGroupGridPrequalificationResponse | Unset = (
        UNSET
    )
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.service_providing_group_grid_prequalification_response import (
            ServiceProvidingGroupGridPrequalificationResponse,  # noqa: PLC0415
        )

        service_providing_group_grid_prequalification_id = self.service_providing_group_grid_prequalification_id

        substation_business_id = self.substation_business_id

        substation_name = self.substation_name

        controllable_unit_count = self.controllable_unit_count

        maximum_active_power = self.maximum_active_power

        total_approved_maximum_active_power = self.total_approved_maximum_active_power

        service_providing_group_grid_prequalification: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group_grid_prequalification, Unset):
            service_providing_group_grid_prequalification = UNSET
        elif isinstance(
            self.service_providing_group_grid_prequalification, ServiceProvidingGroupGridPrequalificationResponse
        ):
            service_providing_group_grid_prequalification = self.service_providing_group_grid_prequalification.to_dict()
        else:
            service_providing_group_grid_prequalification = self.service_providing_group_grid_prequalification

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_providing_group_grid_prequalification_id": service_providing_group_grid_prequalification_id,
                "substation_business_id": substation_business_id,
                "substation_name": substation_name,
                "controllable_unit_count": controllable_unit_count,
                "maximum_active_power": maximum_active_power,
                "total_approved_maximum_active_power": total_approved_maximum_active_power,
            }
        )
        if service_providing_group_grid_prequalification is not UNSET:
            field_dict["service_providing_group_grid_prequalification"] = service_providing_group_grid_prequalification

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_grid_prequalification_response import (
            ServiceProvidingGroupGridPrequalificationResponse,  # noqa: PLC0415
        )

        d = dict(src_dict)
        service_providing_group_grid_prequalification_id = d.pop("service_providing_group_grid_prequalification_id")

        substation_business_id = d.pop("substation_business_id")

        substation_name = d.pop("substation_name")

        controllable_unit_count = d.pop("controllable_unit_count")

        maximum_active_power = d.pop("maximum_active_power")

        total_approved_maximum_active_power = d.pop("total_approved_maximum_active_power")

        def _parse_service_providing_group_grid_prequalification(
            data: object,
        ) -> None | ServiceProvidingGroupGridPrequalificationResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_grid_prequalification_type_0 = (
                    ServiceProvidingGroupGridPrequalificationResponse.from_dict(data)
                )

                return service_providing_group_grid_prequalification_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupGridPrequalificationResponse | Unset, data)

        service_providing_group_grid_prequalification = _parse_service_providing_group_grid_prequalification(
            d.pop("service_providing_group_grid_prequalification", UNSET)
        )

        service_providing_group_grid_prequalification_substation_power_response = cls(
            service_providing_group_grid_prequalification_id=service_providing_group_grid_prequalification_id,
            substation_business_id=substation_business_id,
            substation_name=substation_name,
            controllable_unit_count=controllable_unit_count,
            maximum_active_power=maximum_active_power,
            total_approved_maximum_active_power=total_approved_maximum_active_power,
            service_providing_group_grid_prequalification=service_providing_group_grid_prequalification,
        )

        service_providing_group_grid_prequalification_substation_power_response.additional_properties = d
        return service_providing_group_grid_prequalification_substation_power_response

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
