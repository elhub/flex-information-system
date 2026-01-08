from http import HTTPStatus
from typing import Any, cast

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.service_providing_group_product_suspension_comment import ServiceProvidingGroupProductSuspensionComment
from ...models.service_providing_group_product_suspension_comment_update_request import (
    ServiceProvidingGroupProductSuspensionCommentUpdateRequest,
)
from ...types import Response


def _get_kwargs(
    id: int,
    *,
    body: ServiceProvidingGroupProductSuspensionCommentUpdateRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "patch",
        "url": f"/service_providing_group_product_suspension_comment/{id}",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment | None:
    if response.status_code == 200:
        response_200 = ServiceProvidingGroupProductSuspensionComment.from_dict(response.json())

        return response_200

    if response.status_code == 204:
        response_204 = cast(Any, None)
        return response_204

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

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    id: int,
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupProductSuspensionCommentUpdateRequest,
) -> Response[Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment]:
    """Update Service Providing Group Product Suspension Comment

    Args:
        id (int):
        body (ServiceProvidingGroupProductSuspensionCommentUpdateRequest): Request schema for
            update operations - Comment made by a party involved in a service providing group product
            suspension.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment]
    """

    kwargs = _get_kwargs(
        id=id,
        body=body,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    id: int,
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupProductSuspensionCommentUpdateRequest,
) -> Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment | None:
    """Update Service Providing Group Product Suspension Comment

    Args:
        id (int):
        body (ServiceProvidingGroupProductSuspensionCommentUpdateRequest): Request schema for
            update operations - Comment made by a party involved in a service providing group product
            suspension.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment
    """

    return sync_detailed(
        id=id,
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    id: int,
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupProductSuspensionCommentUpdateRequest,
) -> Response[Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment]:
    """Update Service Providing Group Product Suspension Comment

    Args:
        id (int):
        body (ServiceProvidingGroupProductSuspensionCommentUpdateRequest): Request schema for
            update operations - Comment made by a party involved in a service providing group product
            suspension.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment]
    """

    kwargs = _get_kwargs(
        id=id,
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    id: int,
    *,
    client: AuthenticatedClient,
    body: ServiceProvidingGroupProductSuspensionCommentUpdateRequest,
) -> Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment | None:
    """Update Service Providing Group Product Suspension Comment

    Args:
        id (int):
        body (ServiceProvidingGroupProductSuspensionCommentUpdateRequest): Request schema for
            update operations - Comment made by a party involved in a service providing group product
            suspension.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Any | EmptyObject | ErrorMessage | ErrorMessage | ServiceProvidingGroupProductSuspensionComment
    """

    return (
        await asyncio_detailed(
            id=id,
            client=client,
            body=body,
        )
    ).parsed
