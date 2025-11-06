from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.controllable_unit_lookup_response_accounting_point import (
        ControllableUnitLookupResponseAccountingPoint,
    )
    from ..models.controllable_unit_lookup_response_controllable_units_item import (
        ControllableUnitLookupResponseControllableUnitsItem,
    )
    from ..models.controllable_unit_lookup_response_end_user import ControllableUnitLookupResponseEndUser


T = TypeVar("T", bound="ControllableUnitLookupResponse")


@_attrs_define
class ControllableUnitLookupResponse:
    """Response schema for controllable unit lookup operations

    Attributes:
        accounting_point (ControllableUnitLookupResponseAccountingPoint): The accounting point behind which the
            controllable units are located.
        end_user (ControllableUnitLookupResponseEndUser): The end user on the accounting point where the controllable
            units are located.
        controllable_units (list['ControllableUnitLookupResponseControllableUnitsItem']): The controllable units that
            were found for the given end user or accounting point.
    """

    accounting_point: "ControllableUnitLookupResponseAccountingPoint"
    end_user: "ControllableUnitLookupResponseEndUser"
    controllable_units: list["ControllableUnitLookupResponseControllableUnitsItem"]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        accounting_point = self.accounting_point.to_dict()

        end_user = self.end_user.to_dict()

        controllable_units = []
        for controllable_units_item_data in self.controllable_units:
            controllable_units_item = controllable_units_item_data.to_dict()
            controllable_units.append(controllable_units_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "accounting_point": accounting_point,
                "end_user": end_user,
                "controllable_units": controllable_units,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_lookup_response_accounting_point import (
            ControllableUnitLookupResponseAccountingPoint,
        )
        from ..models.controllable_unit_lookup_response_controllable_units_item import (
            ControllableUnitLookupResponseControllableUnitsItem,
        )
        from ..models.controllable_unit_lookup_response_end_user import ControllableUnitLookupResponseEndUser

        d = dict(src_dict)
        accounting_point = ControllableUnitLookupResponseAccountingPoint.from_dict(d.pop("accounting_point"))

        end_user = ControllableUnitLookupResponseEndUser.from_dict(d.pop("end_user"))

        controllable_units = []
        _controllable_units = d.pop("controllable_units")
        for controllable_units_item_data in _controllable_units:
            controllable_units_item = ControllableUnitLookupResponseControllableUnitsItem.from_dict(
                controllable_units_item_data
            )

            controllable_units.append(controllable_units_item)

        controllable_unit_lookup_response = cls(
            accounting_point=accounting_point,
            end_user=end_user,
            controllable_units=controllable_units,
        )

        controllable_unit_lookup_response.additional_properties = d
        return controllable_unit_lookup_response

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
