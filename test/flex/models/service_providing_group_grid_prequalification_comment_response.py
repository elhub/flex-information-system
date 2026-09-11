from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_prequalification_comment_visibility import (
    ServiceProvidingGroupGridPrequalificationCommentVisibility,
)
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_grid_prequalification_response import (
        ServiceProvidingGroupGridPrequalificationResponse,
    )


T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationCommentResponse")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationCommentResponse:
    """Response schema - Comment made by a party involved in a service providing group grid prequalification.

    Attributes:
        id (int): Unique surrogate identifier. Example: 9.
        service_providing_group_grid_prequalification_id (int): Reference to the service providing group grid
            prequalification. Example: 7.
        created_by (int): Reference to the identity that created the comment. Example: 94.
        created_at (datetime.datetime): When the comment was added to the SPGGP. Example: 2022-08-08 12:00:00+02:00.
        visibility (ServiceProvidingGroupGridPrequalificationCommentVisibility): The level of visibility of the comment.
            Example: same_party.
        content (str): Free text content of the comment. Example: Missing document..
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        service_providing_group_grid_prequalification (None | ServiceProvidingGroupGridPrequalificationResponse |
            Unset): Embedded service_providing_group_grid_prequalification
    """

    id: int
    service_providing_group_grid_prequalification_id: int
    created_by: int
    created_at: datetime.datetime
    visibility: ServiceProvidingGroupGridPrequalificationCommentVisibility
    content: str
    recorded_at: datetime.datetime
    recorded_by: int
    service_providing_group_grid_prequalification: None | ServiceProvidingGroupGridPrequalificationResponse | Unset = (
        UNSET
    )
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.service_providing_group_grid_prequalification_response import (
            ServiceProvidingGroupGridPrequalificationResponse,
        )

        id = self.id

        service_providing_group_grid_prequalification_id = self.service_providing_group_grid_prequalification_id

        created_by = self.created_by

        created_at = self.created_at.isoformat()

        visibility = self.visibility.value

        content = self.content

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_providing_group_grid_prequalification: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group_grid_prequalification, Unset):
            service_providing_group_grid_prequalification = UNSET
        elif isinstance(
            self.service_providing_group_grid_prequalification, ServiceProvidingGroupGridPrequalificationResponse
        ):
            service_providing_group_grid_prequalification = self.service_providing_group_grid_prequalification.to_dict()
        else:
            service_providing_group_grid_prequalification = self.service_providing_group_grid_prequalification

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "service_providing_group_grid_prequalification_id": service_providing_group_grid_prequalification_id,
                "created_by": created_by,
                "created_at": created_at,
                "visibility": visibility,
                "content": content,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if service_providing_group_grid_prequalification is not UNSET:
            field_dict["service_providing_group_grid_prequalification"] = service_providing_group_grid_prequalification

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_grid_prequalification_response import (
            ServiceProvidingGroupGridPrequalificationResponse,
        )

        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_grid_prequalification_id = d.pop("service_providing_group_grid_prequalification_id")

        created_by = d.pop("created_by")

        created_at = datetime.datetime.fromisoformat(d.pop("created_at"))

        visibility = ServiceProvidingGroupGridPrequalificationCommentVisibility(d.pop("visibility"))

        content = d.pop("content")

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_service_providing_group_grid_prequalification(
            data: object,
        ) -> None | ServiceProvidingGroupGridPrequalificationResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_grid_prequalification_type_0 = (
                    ServiceProvidingGroupGridPrequalificationResponse.from_dict(data)
                )

                return service_providing_group_grid_prequalification_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupGridPrequalificationResponse | Unset, data)

        service_providing_group_grid_prequalification = _parse_service_providing_group_grid_prequalification(
            d.pop("service_providing_group_grid_prequalification", UNSET)
        )

        service_providing_group_grid_prequalification_comment_response = cls(
            id=id,
            service_providing_group_grid_prequalification_id=service_providing_group_grid_prequalification_id,
            created_by=created_by,
            created_at=created_at,
            visibility=visibility,
            content=content,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_grid_prequalification=service_providing_group_grid_prequalification,
        )

        service_providing_group_grid_prequalification_comment_response.additional_properties = d
        return service_providing_group_grid_prequalification_comment_response

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
