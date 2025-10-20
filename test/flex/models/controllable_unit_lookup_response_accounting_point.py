from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="ControllableUnitLookupResponseAccountingPoint")


@_attrs_define
class ControllableUnitLookupResponseAccountingPoint:
    """The accounting point behind which the controllable units are located.

    Attributes:
        id (int): The surrogate key of the accounting point. Example: 100351.
        business_id (str): The GSRN metering point ID of the accounting point. Example: 709000000000000057.
    """

    id: int
    business_id: str
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        controllable_unit_lookup_response_accounting_point = cls(
            id=id,
            business_id=business_id,
        )

        controllable_unit_lookup_response_accounting_point.additional_properties = d
        return controllable_unit_lookup_response_accounting_point

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
