from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeDataCuMaximumActivePowerRatio")


@_attrs_define
class NoticeDataCuMaximumActivePowerRatio:
    """Format of the data field in a notice with data.kind = notice.data.cu.maximum_active_power.ratio

    Attributes:
        kind (Literal['notice.data.cu.maximum_active_power.ratio']): Identifies the notice data schema for discriminated
            union deserialization.
        maximum_active_power (float | Unset): The flexible power of the controllable unit in kW. Example: 10.0.
        rated_power (float | Unset): The combined maximum active power of all technical resources in kW. Example: 8.0.
    """

    kind: Literal["notice.data.cu.maximum_active_power.ratio"]
    maximum_active_power: float | Unset = UNSET
    rated_power: float | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        maximum_active_power = self.maximum_active_power

        rated_power = self.rated_power

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "kind": kind,
            }
        )
        if maximum_active_power is not UNSET:
            field_dict["maximum_active_power"] = maximum_active_power
        if rated_power is not UNSET:
            field_dict["rated_power"] = rated_power

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["notice.data.cu.maximum_active_power.ratio"], d.pop("kind"))
        if kind != "notice.data.cu.maximum_active_power.ratio":
            raise ValueError(f"kind must match const 'notice.data.cu.maximum_active_power.ratio', got '{kind}'")

        maximum_active_power = d.pop("maximum_active_power", UNSET)

        rated_power = d.pop("rated_power", UNSET)

        notice_data_cu_maximum_active_power_ratio = cls(
            kind=kind,
            maximum_active_power=maximum_active_power,
            rated_power=rated_power,
        )

        notice_data_cu_maximum_active_power_ratio.additional_properties = d
        return notice_data_cu_maximum_active_power_ratio

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
