from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointEnergySupplierResponse")


@_attrs_define
class AccountingPointEnergySupplierResponse:
    """Response schema for operations with return values - Relation linking an energy supplier to an accounting point.

    Attributes:
        id (Union[Unset, int]): Unique surrogate identifier. Example: 19.
        accounting_point_id (Union[Unset, str]): The GSRN metering point ID of the accounting point. Example:
            709000000000000057.
        energy_supplier_id (Union[Unset, int]): The energy supplier of the accounting point. Example: 37.
        valid_from (Union[Unset, str]): The date from which the relation between the accounting point and the energy
            supplier is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
        valid_to (Union[None, Unset, str]): The date until which the relation between the accounting point and the
            energy supplier is valid. Midnight aligned on Norwegian timezone.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
    """

    id: Union[Unset, int] = UNSET
    accounting_point_id: Union[Unset, str] = UNSET
    energy_supplier_id: Union[Unset, int] = UNSET
    valid_from: Union[Unset, str] = UNSET
    valid_to: Union[None, Unset, str] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = self.id

        accounting_point_id = self.accounting_point_id

        energy_supplier_id = self.energy_supplier_id

        valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id
        if energy_supplier_id is not UNSET:
            field_dict["energy_supplier_id"] = energy_supplier_id
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        id = d.pop("id", UNSET)

        accounting_point_id = d.pop("accounting_point_id", UNSET)

        energy_supplier_id = d.pop("energy_supplier_id", UNSET)

        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        accounting_point_energy_supplier_response = cls(
            id=id,
            accounting_point_id=accounting_point_id,
            energy_supplier_id=energy_supplier_id,
            valid_from=valid_from,
            valid_to=valid_to,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        accounting_point_energy_supplier_response.additional_properties = d
        return accounting_point_energy_supplier_response

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
