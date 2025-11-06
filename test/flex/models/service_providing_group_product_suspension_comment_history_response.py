from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_comment_visibility import (
    ServiceProvidingGroupProductSuspensionCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductSuspensionCommentHistoryResponse")


@_attrs_define
class ServiceProvidingGroupProductSuspensionCommentHistoryResponse:
    """Service Providing Group Product Suspension Comment - history

    Attributes:
        service_providing_group_product_suspension_comment_id (int): Reference to the resource that was updated.
            Example: 48.
        visibility (ServiceProvidingGroupProductSuspensionCommentVisibility | Unset): The level of visibility of the
            comment. Example: same_party.
        content (str | Unset): Free text content of the comment. Example: Missing document..
        service_providing_group_product_suspension_id (int | Unset): Reference to the service providing group product
            suspension. Example: 7.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate identifier. Example: 9.
        created_by (int | Unset): Reference to the identity that created the comment. Example: 94.
        created_at (str | Unset): When the comment was added to the SPGPS. Example: 2022-08-08 12:00:00 CET.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    service_providing_group_product_suspension_comment_id: int
    visibility: ServiceProvidingGroupProductSuspensionCommentVisibility | Unset = UNSET
    content: str | Unset = UNSET
    service_providing_group_product_suspension_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    created_by: int | Unset = UNSET
    created_at: str | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_providing_group_product_suspension_comment_id = (
            self.service_providing_group_product_suspension_comment_id
        )

        visibility: str | Unset = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        content = self.content

        service_providing_group_product_suspension_id = self.service_providing_group_product_suspension_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        created_by = self.created_by

        created_at = self.created_at

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_providing_group_product_suspension_comment_id": service_providing_group_product_suspension_comment_id,
            }
        )
        if visibility is not UNSET:
            field_dict["visibility"] = visibility
        if content is not UNSET:
            field_dict["content"] = content
        if service_providing_group_product_suspension_id is not UNSET:
            field_dict["service_providing_group_product_suspension_id"] = service_providing_group_product_suspension_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id
        if created_by is not UNSET:
            field_dict["created_by"] = created_by
        if created_at is not UNSET:
            field_dict["created_at"] = created_at
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_providing_group_product_suspension_comment_id = d.pop(
            "service_providing_group_product_suspension_comment_id"
        )

        _visibility = d.pop("visibility", UNSET)
        visibility: ServiceProvidingGroupProductSuspensionCommentVisibility | Unset
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ServiceProvidingGroupProductSuspensionCommentVisibility(_visibility)

        content = d.pop("content", UNSET)

        service_providing_group_product_suspension_id = d.pop("service_providing_group_product_suspension_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        created_by = d.pop("created_by", UNSET)

        created_at = d.pop("created_at", UNSET)

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        service_providing_group_product_suspension_comment_history_response = cls(
            service_providing_group_product_suspension_comment_id=service_providing_group_product_suspension_comment_id,
            visibility=visibility,
            content=content,
            service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            created_by=created_by,
            created_at=created_at,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_providing_group_product_suspension_comment_history_response.additional_properties = d
        return service_providing_group_product_suspension_comment_history_response

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
