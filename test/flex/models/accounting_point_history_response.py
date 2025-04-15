from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointHistoryResponse")


@_attrs_define
class AccountingPointHistoryResponse:
    """Accounting Point - history

    Attributes:
        business_id (Union[Unset, str]): The GSRN metering point id of the accounting point. Example:
            709000000000000057.
        metering_grid_area_id (Union[Unset, str]): The metering grid area EIC-X id of the accounting point. Example:
            78X-TEST-123456K.
        system_operator_id (Union[Unset, str]): The system operator of the accounting point
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        accounting_point_id (Union[Unset, int]): Reference to the resource that was updated. Example: 48.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    business_id: Union[Unset, str] = UNSET
    metering_grid_area_id: Union[Unset, str] = UNSET
    system_operator_id: Union[Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    accounting_point_id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        business_id = self.business_id

        metering_grid_area_id = self.metering_grid_area_id

        system_operator_id = self.system_operator_id

        id = self.id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        accounting_point_id = self.accounting_point_id

        replaced_by: Union[None, Unset, int]
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: Union[None, Unset, str]
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if metering_grid_area_id is not UNSET:
            field_dict["metering_grid_area_id"] = metering_grid_area_id
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id
        if id is not UNSET:
            field_dict["id"] = id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        business_id = d.pop("business_id", UNSET)

        metering_grid_area_id = d.pop("metering_grid_area_id", UNSET)

        system_operator_id = d.pop("system_operator_id", UNSET)

        id = d.pop("id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        accounting_point_id = d.pop("accounting_point_id", UNSET)

        def _parse_replaced_by(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        accounting_point_history_response = cls(
            business_id=business_id,
            metering_grid_area_id=metering_grid_area_id,
            system_operator_id=system_operator_id,
            id=id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            accounting_point_id=accounting_point_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        accounting_point_history_response.additional_properties = d
        return accounting_point_history_response

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
