from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeDataControllableUnitCsoNoActiveUsers")


@_attrs_define
class NoticeDataControllableUnitCsoNoActiveUsers:
    """Format of the data field in a notice with data.kind = notice.data.controllable_unit.cso.no_active_users

    Attributes:
        kind (Literal['notice.data.controllable_unit.cso.no_active_users']): Identifies the notice data schema for
            discriminated union deserialization.
        controllable_unit_name (str | Unset): Name of the controllable unit. Example: Heat pump.
        connecting_system_operator_name (str | Unset): Name of the connecting system operator that has no active users.
            Example: Grid Company AS.
    """

    kind: Literal["notice.data.controllable_unit.cso.no_active_users"]
    controllable_unit_name: str | Unset = UNSET
    connecting_system_operator_name: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        controllable_unit_name = self.controllable_unit_name

        connecting_system_operator_name = self.connecting_system_operator_name

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "kind": kind,
            }
        )
        if controllable_unit_name is not UNSET:
            field_dict["controllable_unit_name"] = controllable_unit_name
        if connecting_system_operator_name is not UNSET:
            field_dict["connecting_system_operator_name"] = connecting_system_operator_name

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["notice.data.controllable_unit.cso.no_active_users"], d.pop("kind"))
        if kind != "notice.data.controllable_unit.cso.no_active_users":
            raise ValueError(f"kind must match const 'notice.data.controllable_unit.cso.no_active_users', got '{kind}'")

        controllable_unit_name = d.pop("controllable_unit_name", UNSET)

        connecting_system_operator_name = d.pop("connecting_system_operator_name", UNSET)

        notice_data_controllable_unit_cso_no_active_users = cls(
            kind=kind,
            controllable_unit_name=controllable_unit_name,
            connecting_system_operator_name=connecting_system_operator_name,
        )

        notice_data_controllable_unit_cso_no_active_users.additional_properties = d
        return notice_data_controllable_unit_cso_no_active_users

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
