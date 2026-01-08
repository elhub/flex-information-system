from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.entity import Entity
from ...models.entity_create_request import EntityCreateRequest
from ...models.error_message import ErrorMessage
from ...types import Response


def _get_kwargs(
    *,
    body: EntityCreateRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/entity",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> EmptyObject | ErrorMessage | Entity | ErrorMessage | None:
    if response.status_code == 201:
        response_201 = Entity.from_dict(response.json())

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
) -> Response[EmptyObject | ErrorMessage | Entity | ErrorMessage]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    body: EntityCreateRequest,
) -> Response[EmptyObject | ErrorMessage | Entity | ErrorMessage]:
    """Create Entity

    Args:
        body (EntityCreateRequest): Request schema for create operations - Entity - Natural or
            legal person

            An entity is a natural or legal person that can be a party in the Flexibility Information
            System.

            Example entity types:

            * Person
            * Organisation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | Entity | ErrorMessage]
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
    body: EntityCreateRequest,
) -> EmptyObject | ErrorMessage | Entity | ErrorMessage | None:
    """Create Entity

    Args:
        body (EntityCreateRequest): Request schema for create operations - Entity - Natural or
            legal person

            An entity is a natural or legal person that can be a party in the Flexibility Information
            System.

            Example entity types:

            * Person
            * Organisation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | Entity | ErrorMessage
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    body: EntityCreateRequest,
) -> Response[EmptyObject | ErrorMessage | Entity | ErrorMessage]:
    """Create Entity

    Args:
        body (EntityCreateRequest): Request schema for create operations - Entity - Natural or
            legal person

            An entity is a natural or legal person that can be a party in the Flexibility Information
            System.

            Example entity types:

            * Person
            * Organisation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | Entity | ErrorMessage]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    body: EntityCreateRequest,
) -> EmptyObject | ErrorMessage | Entity | ErrorMessage | None:
    """Create Entity

    Args:
        body (EntityCreateRequest): Request schema for create operations - Entity - Natural or
            legal person

            An entity is a natural or legal person that can be a party in the Flexibility Information
            System.

            Example entity types:

            * Person
            * Organisation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | Entity | ErrorMessage
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
