from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.accounting_point_grid_location_object_type import AccountingPointGridLocationObjectType
from ..models.accounting_point_grid_location_quality import AccountingPointGridLocationQuality
from ..models.accounting_point_grid_location_source import AccountingPointGridLocationSource
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointGridLocationHistoryResponse")


@_attrs_define
class AccountingPointGridLocationHistoryResponse:
    """Accounting Point Grid Location - history

    Attributes:
        id (int): Unique surrogate key. Example: 1.
        accounting_point_id (int): The accounting point this grid location belongs to. Example: 45.
        object_type (AccountingPointGridLocationObjectType): The type of object in the common grid model that the
            accounting point is at. Example: substation.
        name (str): Name of the grid model object at the location. Example: Snilldal 1 KRA.
        nominal_voltage (float): Nominal voltage level at the grid location, in kilovolt (kV). Example: 22.
        source (AccountingPointGridLocationSource): How the grid location was determined. Example: cso.
        quality (AccountingPointGridLocationQuality): The quality of the grid location registration. Example: confirmed.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        accounting_point_grid_location_id (int): Reference to the resource that was updated. Example: 48.
        business_id (None | str | Unset): Business identifier (mRID) referencing the object in the common grid model.
            Example: 53919b79-876f-4dad-8bde-b29368367604.
        additional_information (None | str | Unset): Free text field for extra information about the grid location if
            needed.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    accounting_point_id: int
    object_type: AccountingPointGridLocationObjectType
    name: str
    nominal_voltage: float
    source: AccountingPointGridLocationSource
    quality: AccountingPointGridLocationQuality
    recorded_at: datetime.datetime
    recorded_by: int
    accounting_point_grid_location_id: int
    business_id: None | str | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        accounting_point_id = self.accounting_point_id

        object_type = self.object_type.value

        name = self.name

        nominal_voltage = self.nominal_voltage

        source = self.source.value

        quality = self.quality.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        accounting_point_grid_location_id = self.accounting_point_grid_location_id

        business_id: None | str | Unset
        if isinstance(self.business_id, Unset):
            business_id = UNSET
        else:
            business_id = self.business_id

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        elif isinstance(self.replaced_at, datetime.datetime):
            replaced_at = self.replaced_at.isoformat()
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "accounting_point_id": accounting_point_id,
                "object_type": object_type,
                "name": name,
                "nominal_voltage": nominal_voltage,
                "source": source,
                "quality": quality,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "accounting_point_grid_location_id": accounting_point_grid_location_id,
            }
        )
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        accounting_point_id = d.pop("accounting_point_id")

        object_type = AccountingPointGridLocationObjectType(d.pop("object_type"))

        name = d.pop("name")

        nominal_voltage = d.pop("nominal_voltage")

        source = AccountingPointGridLocationSource(d.pop("source"))

        quality = AccountingPointGridLocationQuality(d.pop("quality"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        accounting_point_grid_location_id = d.pop("accounting_point_grid_location_id")

        def _parse_business_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        business_id = _parse_business_id(d.pop("business_id", UNSET))

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                replaced_at_type_0 = isoparse(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        accounting_point_grid_location_history_response = cls(
            id=id,
            accounting_point_id=accounting_point_id,
            object_type=object_type,
            name=name,
            nominal_voltage=nominal_voltage,
            source=source,
            quality=quality,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            accounting_point_grid_location_id=accounting_point_grid_location_id,
            business_id=business_id,
            additional_information=additional_information,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        accounting_point_grid_location_history_response.additional_properties = d
        return accounting_point_grid_location_history_response

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
