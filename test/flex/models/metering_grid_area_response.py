from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.metering_grid_area_business_id_type import MeteringGridAreaBusinessIdType
from ..models.metering_grid_area_status import MeteringGridAreaStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_metering_grid_area_response import AccountingPointMeteringGridAreaResponse


T = TypeVar("T", bound="MeteringGridAreaResponse")


@_attrs_define
class MeteringGridAreaResponse:
    """Response schema - Metering grid area to which accounting points belong.

    Attributes:
        id (int): Unique surrogate identifier. Example: 3.
        business_id (str): The business identifier of the metering grid area. Format depends on `business_id_type`.
            Example: 24YAOER9FNW34FNN.
        business_id_type (MeteringGridAreaBusinessIdType): The type of the business identifier. Example: eic_y.
        name (str): The name of the metering grid area. Example: VN04VESTNORGEDX12.
        status (MeteringGridAreaStatus): The status of the metering grid area. Example: active.
        accounting_point_metering_grid_area (list[AccountingPointMeteringGridAreaResponse] | None | Unset): Embedded
            accounting_point_metering_grid_area
    """

    id: int
    business_id: str
    business_id_type: MeteringGridAreaBusinessIdType
    name: str
    status: MeteringGridAreaStatus
    accounting_point_metering_grid_area: list[AccountingPointMeteringGridAreaResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        business_id_type = self.business_id_type.value

        name = self.name

        status = self.status.value

        accounting_point_metering_grid_area: list[dict[str, Any]] | None | Unset
        if isinstance(self.accounting_point_metering_grid_area, Unset):
            accounting_point_metering_grid_area = UNSET
        elif isinstance(self.accounting_point_metering_grid_area, list):
            accounting_point_metering_grid_area = []
            for accounting_point_metering_grid_area_type_0_item_data in self.accounting_point_metering_grid_area:
                accounting_point_metering_grid_area_type_0_item = (
                    accounting_point_metering_grid_area_type_0_item_data.to_dict()
                )
                accounting_point_metering_grid_area.append(accounting_point_metering_grid_area_type_0_item)

        else:
            accounting_point_metering_grid_area = self.accounting_point_metering_grid_area

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "business_id_type": business_id_type,
                "name": name,
                "status": status,
            }
        )
        if accounting_point_metering_grid_area is not UNSET:
            field_dict["accounting_point_metering_grid_area"] = accounting_point_metering_grid_area

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_metering_grid_area_response import AccountingPointMeteringGridAreaResponse

        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        business_id_type = MeteringGridAreaBusinessIdType(d.pop("business_id_type"))

        name = d.pop("name")

        status = MeteringGridAreaStatus(d.pop("status"))

        def _parse_accounting_point_metering_grid_area(
            data: object,
        ) -> list[AccountingPointMeteringGridAreaResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                accounting_point_metering_grid_area_type_0 = []
                _accounting_point_metering_grid_area_type_0 = data
                for accounting_point_metering_grid_area_type_0_item_data in _accounting_point_metering_grid_area_type_0:
                    accounting_point_metering_grid_area_type_0_item = AccountingPointMeteringGridAreaResponse.from_dict(
                        accounting_point_metering_grid_area_type_0_item_data
                    )

                    accounting_point_metering_grid_area_type_0.append(accounting_point_metering_grid_area_type_0_item)

                return accounting_point_metering_grid_area_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[AccountingPointMeteringGridAreaResponse] | None | Unset, data)

        accounting_point_metering_grid_area = _parse_accounting_point_metering_grid_area(
            d.pop("accounting_point_metering_grid_area", UNSET)
        )

        metering_grid_area_response = cls(
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            name=name,
            status=status,
            accounting_point_metering_grid_area=accounting_point_metering_grid_area,
        )

        metering_grid_area_response.additional_properties = d
        return metering_grid_area_response

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
