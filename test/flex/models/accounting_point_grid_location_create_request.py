from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_grid_location_object_type import AccountingPointGridLocationObjectType
from ..models.accounting_point_grid_location_quality import AccountingPointGridLocationQuality
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointGridLocationCreateRequest")


@_attrs_define
class AccountingPointGridLocationCreateRequest:
    """Request schema for create operations - The electrical (topological) location of an accounting point in the common
    grid model (Nemo).

        Attributes:
            accounting_point_id (int): The accounting point this grid location belongs to. Example: 45.
            object_type (AccountingPointGridLocationObjectType): The type of object in the common grid model that the
                accounting point is at. Example: substation.
            business_id (str): Business identifier (mRID) referencing the object in the common grid model. Example:
                53919b79-876f-4dad-8bde-b29368367604.
            name (str): Name of the grid model object at the location. Example: Snilldal 1 KRA.
            nominal_voltage (float): Nominal voltage level at the grid location, in kilovolt (kV). Example: 22.
            quality (AccountingPointGridLocationQuality): The quality of the grid location registration. Example: confirmed.
            additional_information (None | str | Unset): Free text field for extra information about the grid location if
                needed.
    """

    accounting_point_id: int
    object_type: AccountingPointGridLocationObjectType
    business_id: str
    name: str
    nominal_voltage: float
    quality: AccountingPointGridLocationQuality
    additional_information: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        accounting_point_id = self.accounting_point_id

        object_type = self.object_type.value

        business_id = self.business_id

        name = self.name

        nominal_voltage = self.nominal_voltage

        quality = self.quality.value

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "accounting_point_id": accounting_point_id,
                "object_type": object_type,
                "business_id": business_id,
                "name": name,
                "nominal_voltage": nominal_voltage,
                "quality": quality,
            }
        )
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id")

        object_type = AccountingPointGridLocationObjectType(d.pop("object_type"))

        business_id = d.pop("business_id")

        name = d.pop("name")

        nominal_voltage = d.pop("nominal_voltage")

        quality = AccountingPointGridLocationQuality(d.pop("quality"))

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        accounting_point_grid_location_create_request = cls(
            accounting_point_id=accounting_point_id,
            object_type=object_type,
            business_id=business_id,
            name=name,
            nominal_voltage=nominal_voltage,
            quality=quality,
            additional_information=additional_information,
        )

        accounting_point_grid_location_create_request.additional_properties = d
        return accounting_point_grid_location_create_request

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
