from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.metering_grid_area_price_area import MeteringGridAreaPriceArea
from ..types import UNSET, Unset

T = TypeVar("T", bound="MeteringGridAreaResponse")


@_attrs_define
class MeteringGridAreaResponse:
    """Response schema for operations with return values - Metering grid area owned by a system operator.

    Attributes:
        price_area (Union[Unset, MeteringGridAreaPriceArea]): The price area the MGA belongs to. Example: NO2.
        valid_from (Union[None, Unset, str]): The date from which the metering grid area is valid. Midnight aligned on
            Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
        valid_to (Union[None, Unset, str]): The date until which the metering grid area is valid. Midnight aligned on
            Norwegian timezone. Example: 2022-09-10 00:00:00 CET.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
        business_id (Union[Unset, str]): The EIC-X ID of the metering grid area. Example: 78X-TEST-123456K.
        name (Union[Unset, str]): The name of the metering grid area. Example: KL3 N4.
        system_operator_id (Union[Unset, int]): The system operator that owns the metering grid area.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
    """

    price_area: Union[Unset, MeteringGridAreaPriceArea] = UNSET
    valid_from: Union[None, Unset, str] = UNSET
    valid_to: Union[None, Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    business_id: Union[Unset, str] = UNSET
    name: Union[Unset, str] = UNSET
    system_operator_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        price_area: Union[Unset, str] = UNSET
        if not isinstance(self.price_area, Unset):
            price_area = self.price_area.value

        valid_from: Union[None, Unset, str]
        if isinstance(self.valid_from, Unset):
            valid_from = UNSET
        else:
            valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        id = self.id

        business_id = self.business_id

        name = self.name

        system_operator_id = self.system_operator_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if price_area is not UNSET:
            field_dict["price_area"] = price_area
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if id is not UNSET:
            field_dict["id"] = id
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if name is not UNSET:
            field_dict["name"] = name
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _price_area = d.pop("price_area", UNSET)
        price_area: Union[Unset, MeteringGridAreaPriceArea]
        if isinstance(_price_area, Unset):
            price_area = UNSET
        else:
            price_area = MeteringGridAreaPriceArea(_price_area)

        def _parse_valid_from(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        valid_from = _parse_valid_from(d.pop("valid_from", UNSET))

        def _parse_valid_to(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        id = d.pop("id", UNSET)

        business_id = d.pop("business_id", UNSET)

        name = d.pop("name", UNSET)

        system_operator_id = d.pop("system_operator_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        metering_grid_area_response = cls(
            price_area=price_area,
            valid_from=valid_from,
            valid_to=valid_to,
            id=id,
            business_id=business_id,
            name=name,
            system_operator_id=system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        metering_grid_area_response.additional_properties = d
        return metering_grid_area_response

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
