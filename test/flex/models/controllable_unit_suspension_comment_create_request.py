from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.controllable_unit_suspension_comment_visibility import ControllableUnitSuspensionCommentVisibility
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitSuspensionCommentCreateRequest")


@_attrs_define
class ControllableUnitSuspensionCommentCreateRequest:
    """Request schema for create operations - Comment made by a party involved in a controllable unit suspension.

    Attributes:
        controllable_unit_suspension_id (int): Reference to the controllable unit suspension. Example: 7.
        content (str): Free text content of the comment. Example: Missing document..
        visibility (ControllableUnitSuspensionCommentVisibility | Unset): The level of visibility of the comment.
            Example: same_party.
    """

    controllable_unit_suspension_id: int
    content: str
    visibility: ControllableUnitSuspensionCommentVisibility | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        controllable_unit_suspension_id = self.controllable_unit_suspension_id

        content = self.content

        visibility: str | Unset = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "controllable_unit_suspension_id": controllable_unit_suspension_id,
                "content": content,
            }
        )
        if visibility is not UNSET:
            field_dict["visibility"] = visibility

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        controllable_unit_suspension_id = d.pop("controllable_unit_suspension_id")

        content = d.pop("content")

        _visibility = d.pop("visibility", UNSET)
        visibility: ControllableUnitSuspensionCommentVisibility | Unset
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ControllableUnitSuspensionCommentVisibility(_visibility)

        controllable_unit_suspension_comment_create_request = cls(
            controllable_unit_suspension_id=controllable_unit_suspension_id,
            content=content,
            visibility=visibility,
        )

        controllable_unit_suspension_comment_create_request.additional_properties = d
        return controllable_unit_suspension_comment_create_request

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
