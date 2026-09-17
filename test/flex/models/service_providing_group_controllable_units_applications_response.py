from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_controllable_units_applications_response_grid_prequalification import (
        ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification,
    )
    from ..models.service_providing_group_controllable_units_applications_response_product_applications_item import (
        ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplicationsItem,
    )


T = TypeVar("T", bound="ServiceProvidingGroupControllableUnitsApplicationsResponse")


@_attrs_define
class ServiceProvidingGroupControllableUnitsApplicationsResponse:
    """
    Attributes:
        id (int | Unset): The surrogate key of the controllable unit Example: 123.
        name (str | Unset): The name of the controllable unit Example: Battery 101.
        service_providing_group_id (int | Unset): The surrogate key of the service providing group Example: 123.
        grid_prequalification (ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification | Unset):
            Details about the grid prequalification for this controllable unit
        product_applications (list[ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplicationsItem] |
            Unset): Details about the product applications for this controllable unit
    """

    id: int | Unset = UNSET
    name: str | Unset = UNSET
    service_providing_group_id: int | Unset = UNSET
    grid_prequalification: ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification | Unset = (
        UNSET
    )
    product_applications: (
        list[ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplicationsItem] | Unset
    ) = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        service_providing_group_id = self.service_providing_group_id

        grid_prequalification: dict[str, Any] | Unset = UNSET
        if not isinstance(self.grid_prequalification, Unset):
            grid_prequalification = self.grid_prequalification.to_dict()

        product_applications: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.product_applications, Unset):
            product_applications = []
            for product_applications_item_data in self.product_applications:
                product_applications_item = product_applications_item_data.to_dict()
                product_applications.append(product_applications_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if name is not UNSET:
            field_dict["name"] = name
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
        if grid_prequalification is not UNSET:
            field_dict["grid_prequalification"] = grid_prequalification
        if product_applications is not UNSET:
            field_dict["product_applications"] = product_applications

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_controllable_units_applications_response_grid_prequalification import (
            ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification,
        )
        from ..models.service_providing_group_controllable_units_applications_response_product_applications_item import (
            ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplicationsItem,
        )

        d = dict(src_dict)
        id = d.pop("id", UNSET)

        name = d.pop("name", UNSET)

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        _grid_prequalification = d.pop("grid_prequalification", UNSET)
        grid_prequalification: ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification | Unset
        if isinstance(_grid_prequalification, Unset):
            grid_prequalification = UNSET
        else:
            grid_prequalification = (
                ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification.from_dict(
                    _grid_prequalification
                )
            )

        _product_applications = d.pop("product_applications", UNSET)
        product_applications: (
            list[ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplicationsItem] | Unset
        ) = UNSET
        if _product_applications is not UNSET:
            product_applications = []
            for product_applications_item_data in _product_applications:
                product_applications_item = (
                    ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplicationsItem.from_dict(
                        product_applications_item_data
                    )
                )

                product_applications.append(product_applications_item)

        service_providing_group_controllable_units_applications_response = cls(
            id=id,
            name=name,
            service_providing_group_id=service_providing_group_id,
            grid_prequalification=grid_prequalification,
            product_applications=product_applications,
        )

        service_providing_group_controllable_units_applications_response.additional_properties = d
        return service_providing_group_controllable_units_applications_response

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
