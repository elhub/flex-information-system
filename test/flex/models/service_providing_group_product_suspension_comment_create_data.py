from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_comment_visibility import (
    ServiceProvidingGroupProductSuspensionCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductSuspensionCommentCreateData")


@_attrs_define
class ServiceProvidingGroupProductSuspensionCommentCreateData:
    """Data of the request schema for create operations - Comment made by a party involved in a service providing group
    product suspension.

        Attributes:
            visibility (ServiceProvidingGroupProductSuspensionCommentVisibility | Unset): The level of visibility of the
                comment. Example: same_party.
            content (str | Unset): Free text content of the comment. Example: Missing document..
            service_providing_group_product_suspension_id (int | Unset): Reference to the service providing group product
                suspension. Example: 7.
    """

    visibility: ServiceProvidingGroupProductSuspensionCommentVisibility | Unset = UNSET
    content: str | Unset = UNSET
    service_providing_group_product_suspension_id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        visibility: str | Unset = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        content = self.content

        service_providing_group_product_suspension_id = self.service_providing_group_product_suspension_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if visibility is not UNSET:
            field_dict["visibility"] = visibility
        if content is not UNSET:
            field_dict["content"] = content
        if service_providing_group_product_suspension_id is not UNSET:
            field_dict["service_providing_group_product_suspension_id"] = service_providing_group_product_suspension_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _visibility = d.pop("visibility", UNSET)
        visibility: ServiceProvidingGroupProductSuspensionCommentVisibility | Unset
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ServiceProvidingGroupProductSuspensionCommentVisibility(_visibility)

        content = d.pop("content", UNSET)

        service_providing_group_product_suspension_id = d.pop("service_providing_group_product_suspension_id", UNSET)

        service_providing_group_product_suspension_comment_create_data = cls(
            visibility=visibility,
            content=content,
            service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
        )

        service_providing_group_product_suspension_comment_create_data.additional_properties = d
        return service_providing_group_product_suspension_comment_create_data

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
