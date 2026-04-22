from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_grid_location_object_type import AccountingPointGridLocationObjectType
from ..models.accounting_point_grid_location_quality import AccountingPointGridLocationQuality
from ..models.accounting_point_grid_location_source import AccountingPointGridLocationSource
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointGridLocationUpdateRequest")


@_attrs_define
class AccountingPointGridLocationUpdateRequest:
    """Request schema for update operations - The electrical (topological) location of an accounting point in the common
    grid model (Nemo).

        Attributes:
            object_type (AccountingPointGridLocationObjectType | Unset): The type of object in the common grid model that
                the accounting point is at. Example: substation.
            business_id (None | str | Unset): Business identifier (mRID) referencing the object in the common grid model.
                Example: 53919b79-876f-4dad-8bde-b29368367604.
            name (str | Unset): Name of the grid model object at the location. Example: Snilldal 1 KRA.
            nominal_voltage (float | Unset): Nominal voltage level at the grid location, in kilovolt (kV). Example: 22.
            additional_information (None | str | Unset): Free text field for extra information about the grid location if
                needed.
            source (AccountingPointGridLocationSource | Unset): How the grid location was determined. Example: cso.
            quality (AccountingPointGridLocationQuality | Unset): The quality of the grid location registration. Example:
                confirmed.
    """

    object_type: AccountingPointGridLocationObjectType | Unset = UNSET
    business_id: None | str | Unset = UNSET
    name: str | Unset = UNSET
    nominal_voltage: float | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    source: AccountingPointGridLocationSource | Unset = UNSET
    quality: AccountingPointGridLocationQuality | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        object_type: str | Unset = UNSET
        if not isinstance(self.object_type, Unset):
            object_type = self.object_type.value

        business_id: None | str | Unset
        if isinstance(self.business_id, Unset):
            business_id = UNSET
        else:
            business_id = self.business_id

        name = self.name

        nominal_voltage = self.nominal_voltage

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        source: str | Unset = UNSET
        if not isinstance(self.source, Unset):
            source = self.source.value

        quality: str | Unset = UNSET
        if not isinstance(self.quality, Unset):
            quality = self.quality.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if object_type is not UNSET:
            field_dict["object_type"] = object_type
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if name is not UNSET:
            field_dict["name"] = name
        if nominal_voltage is not UNSET:
            field_dict["nominal_voltage"] = nominal_voltage
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if source is not UNSET:
            field_dict["source"] = source
        if quality is not UNSET:
            field_dict["quality"] = quality

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _object_type = d.pop("object_type", UNSET)
        object_type: AccountingPointGridLocationObjectType | Unset
        if isinstance(_object_type, Unset):
            object_type = UNSET
        else:
            object_type = AccountingPointGridLocationObjectType(_object_type)

        def _parse_business_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        business_id = _parse_business_id(d.pop("business_id", UNSET))

        name = d.pop("name", UNSET)

        nominal_voltage = d.pop("nominal_voltage", UNSET)

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        _source = d.pop("source", UNSET)
        source: AccountingPointGridLocationSource | Unset
        if isinstance(_source, Unset):
            source = UNSET
        else:
            source = AccountingPointGridLocationSource(_source)

        _quality = d.pop("quality", UNSET)
        quality: AccountingPointGridLocationQuality | Unset
        if isinstance(_quality, Unset):
            quality = UNSET
        else:
            quality = AccountingPointGridLocationQuality(_quality)

        accounting_point_grid_location_update_request = cls(
            object_type=object_type,
            business_id=business_id,
            name=name,
            nominal_voltage=nominal_voltage,
            additional_information=additional_information,
            source=source,
            quality=quality,
        )

        accounting_point_grid_location_update_request.additional_properties = d
        return accounting_point_grid_location_update_request

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
