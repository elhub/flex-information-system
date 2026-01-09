from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.membership_relation_of_controllable_unit_in_service_providing_group_response import (
    MembershipRelationOfControllableUnitInServiceProvidingGroupResponse,
)
from ...models.service_providing_group_membership_create_request import ServiceProvidingGroupMembershipCreateRequest
from ...types import Response


def _get_kwargs(
    *,
    body: ServiceProvidingGroupMembershipCreateRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/service_providing_group_membership",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> (
    EmptyObject
    | ErrorMessage
    | ErrorMessage
    | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
    | None
):
    if response.status_code == 201:
        response_201 = MembershipRelationOfControllableUnitInServiceProvidingGroupResponse.from_dict(response.json())

        return response_201

    if response.status_code == 400:
        response_400 = ErrorMessage.from_dict(response.json())

        return response_400

    if response.status_code == 401:
        response_401 = ErrorMessage.from_dict(response.json())

        return response_401

    if response.status_code == 403:
        response_403 = ErrorMessage.from_dict(response.json())

        return response_403

    if response.status_code == 404:

        def _parse_response_404(data: object) -> EmptyObject | ErrorMessage:
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                response_404_type_0 = ErrorMessage.from_dict(data)

                return response_404_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            if not isinstance(data, dict):
                raise TypeError()
            response_404_type_1 = EmptyObject.from_dict(data)

            return response_404_type_1

        response_404 = _parse_response_404(response.json())

        return response_404

    if response.status_code == 406:
        response_406 = ErrorMessage.from_dict(response.json())

        return response_406

    if response.status_code == 409:
        response_409 = ErrorMessage.from_dict(response.json())

        return response_409

    if response.status_code == 500:
        response_500 = ErrorMessage.from_dict(response.json())

        return response_500

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[
    EmptyObject | ErrorMessage | ErrorMessage | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupMembershipCreateRequest,
) -> Response[
    EmptyObject | ErrorMessage | ErrorMessage | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
]:
    """Create Membership relation of controllable unit in service providing group

    Args:
        body (ServiceProvidingGroupMembershipCreateRequest): Request schema for create operations
            - Membership relation of controllable unit in service providing group

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | ErrorMessage | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupMembershipCreateRequest,
) -> (
    EmptyObject
    | ErrorMessage
    | ErrorMessage
    | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
    | None
):
    """Create Membership relation of controllable unit in service providing group

    Args:
        body (ServiceProvidingGroupMembershipCreateRequest): Request schema for create operations
            - Membership relation of controllable unit in service providing group

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | ErrorMessage | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupMembershipCreateRequest,
) -> Response[
    EmptyObject | ErrorMessage | ErrorMessage | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
]:
    """Create Membership relation of controllable unit in service providing group

    Args:
        body (ServiceProvidingGroupMembershipCreateRequest): Request schema for create operations
            - Membership relation of controllable unit in service providing group

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | ErrorMessage | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupMembershipCreateRequest,
) -> (
    EmptyObject
    | ErrorMessage
    | ErrorMessage
    | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
    | None
):
    """Create Membership relation of controllable unit in service providing group

    Args:
        body (ServiceProvidingGroupMembershipCreateRequest): Request schema for create operations
            - Membership relation of controllable unit in service providing group

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | ErrorMessage | MembershipRelationOfControllableUnitInServiceProvidingGroupResponse
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
