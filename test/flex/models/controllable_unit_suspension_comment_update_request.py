from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.controllable_unit_suspension_comment_visibility import ControllableUnitSuspensionCommentVisibility
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitSuspensionCommentUpdateRequest")


@_attrs_define
class ControllableUnitSuspensionCommentUpdateRequest:
    """Request schema for update operations - Comment made by a party involved in a controllable unit suspension.

    Attributes:
        visibility (ControllableUnitSuspensionCommentVisibility | Unset): The level of visibility of the comment.
            Example: same_party.
        content (str | Unset): Free text content of the comment. Example: Missing document..
    """

    visibility: ControllableUnitSuspensionCommentVisibility | Unset = UNSET
    content: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        visibility: str | Unset = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        content = self.content

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if visibility is not UNSET:
            field_dict["visibility"] = visibility
        if content is not UNSET:
            field_dict["content"] = content

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _visibility = d.pop("visibility", UNSET)
        visibility: ControllableUnitSuspensionCommentVisibility | Unset
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ControllableUnitSuspensionCommentVisibility(_visibility)

        content = d.pop("content", UNSET)

        controllable_unit_suspension_comment_update_request = cls(
            visibility=visibility,
            content=content,
        )

        controllable_unit_suspension_comment_update_request.additional_properties = d
        return controllable_unit_suspension_comment_update_request

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
