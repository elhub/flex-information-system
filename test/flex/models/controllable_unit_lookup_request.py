from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitLookupRequest")


@_attrs_define
class ControllableUnitLookupRequest:
    """Request schema for controllable unit lookup operations

    Attributes:
        end_user_id (int): The identifier of the current end user on the controllable unit(s) to lookup. Example: 379.
        business_id (Union[Unset, str]): The business ID of the controllable unit to lookup. Example:
            53919b79-876f-4dad-8bde-b29368367604.
        accounting_point_id (Union[Unset, str]): The accounting point ID of the controllable unit(s) to lookup. `GSRN`
            metering point id. Example: 709000000000000057.
    """

    end_user_id: int
    business_id: Union[Unset, str] = UNSET
    accounting_point_id: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        end_user_id = self.end_user_id

        business_id = self.business_id

        accounting_point_id = self.accounting_point_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "end_user_id": end_user_id,
            }
        )
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        end_user_id = d.pop("end_user_id")

        business_id = d.pop("business_id", UNSET)

        accounting_point_id = d.pop("accounting_point_id", UNSET)

        controllable_unit_lookup_request = cls(
            end_user_id=end_user_id,
            business_id=business_id,
            accounting_point_id=accounting_point_id,
        )

        controllable_unit_lookup_request.additional_properties = d
        return controllable_unit_lookup_request

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
