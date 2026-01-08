from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_prequalification_comment_visibility import (
    ServiceProvidingGroupGridPrequalificationCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationCommentCreateRequest")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationCommentCreateRequest:
    """Request schema for create operations - Comment made by a party involved in a service providing group grid
    prequalification.

        Attributes:
            service_providing_group_grid_prequalification_id (int): Reference to the service providing group grid
                prequalification. Example: 7.
            content (str): Free text content of the comment. Example: Missing document..
            visibility (ServiceProvidingGroupGridPrequalificationCommentVisibility | Unset): The level of visibility of the
                comment. Example: same_party.
    """

    service_providing_group_grid_prequalification_id: int
    content: str
    visibility: ServiceProvidingGroupGridPrequalificationCommentVisibility | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_providing_group_grid_prequalification_id = self.service_providing_group_grid_prequalification_id

        content = self.content

        visibility: str | Unset = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_providing_group_grid_prequalification_id": service_providing_group_grid_prequalification_id,
                "content": content,
            }
        )
        if visibility is not UNSET:
            field_dict["visibility"] = visibility

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_providing_group_grid_prequalification_id = d.pop("service_providing_group_grid_prequalification_id")

        content = d.pop("content")

        _visibility = d.pop("visibility", UNSET)
        visibility: ServiceProvidingGroupGridPrequalificationCommentVisibility | Unset
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ServiceProvidingGroupGridPrequalificationCommentVisibility(_visibility)

        service_providing_group_grid_prequalification_comment_create_request = cls(
            service_providing_group_grid_prequalification_id=service_providing_group_grid_prequalification_id,
            content=content,
            visibility=visibility,
        )

        service_providing_group_grid_prequalification_comment_create_request.additional_properties = d
        return service_providing_group_grid_prequalification_comment_create_request

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
