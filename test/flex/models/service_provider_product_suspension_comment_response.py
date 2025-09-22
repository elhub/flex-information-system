from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_suspension_comment_visibility import (
    ServiceProviderProductSuspensionCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductSuspensionCommentResponse")


@_attrs_define
class ServiceProviderProductSuspensionCommentResponse:
    """Response schema for operations with return values - Comment made by a party involved in a service provider product
    suspension.

        Attributes:
            visibility (Union[Unset, ServiceProviderProductSuspensionCommentVisibility]): The level of visibility of the
                comment. Example: same_party.
            content (Union[Unset, str]): Free text content of the comment. Example: Missing document..
            service_provider_product_suspension_id (Union[Unset, int]): Reference to the service provider product
                suspension. Example: 7.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
            id (Union[Unset, int]): Unique surrogate identifier. Example: 9.
            created_by (Union[Unset, int]): Reference to the identity that created the comment. Example: 94.
            created_at (Union[Unset, str]): When the comment was added to the suspension. Example: 2022-08-08 12:00:00 CET.
    """

    visibility: Union[Unset, ServiceProviderProductSuspensionCommentVisibility] = UNSET
    content: Union[Unset, str] = UNSET
    service_provider_product_suspension_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    created_by: Union[Unset, int] = UNSET
    created_at: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        visibility: Union[Unset, str] = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        content = self.content

        service_provider_product_suspension_id = self.service_provider_product_suspension_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        created_by = self.created_by

        created_at = self.created_at

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if visibility is not UNSET:
            field_dict["visibility"] = visibility
        if content is not UNSET:
            field_dict["content"] = content
        if service_provider_product_suspension_id is not UNSET:
            field_dict["service_provider_product_suspension_id"] = service_provider_product_suspension_id
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

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _visibility = d.pop("visibility", UNSET)
        visibility: Union[Unset, ServiceProviderProductSuspensionCommentVisibility]
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ServiceProviderProductSuspensionCommentVisibility(_visibility)

        content = d.pop("content", UNSET)

        service_provider_product_suspension_id = d.pop("service_provider_product_suspension_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        created_by = d.pop("created_by", UNSET)

        created_at = d.pop("created_at", UNSET)

        service_provider_product_suspension_comment_response = cls(
            visibility=visibility,
            content=content,
            service_provider_product_suspension_id=service_provider_product_suspension_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            created_by=created_by,
            created_at=created_at,
        )

        service_provider_product_suspension_comment_response.additional_properties = d
        return service_provider_product_suspension_comment_response

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
