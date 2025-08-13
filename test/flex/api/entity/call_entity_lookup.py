from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.entity_lookup_request import EntityLookupRequest
from ...models.entity_lookup_response import EntityLookupResponse
from ...models.error_message import ErrorMessage
from ...types import Response


def _get_kwargs(
    *,
    body: EntityLookupRequest,
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": "/entity/lookup",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[EntityLookupResponse, ErrorMessage]]:
    if response.status_code == 200:
        response_200 = EntityLookupResponse.from_dict(response.json())

        return response_200
    if response.status_code == 201:
        response_201 = EntityLookupResponse.from_dict(response.json())

        return response_201
    if response.status_code == 400:
        response_400 = ErrorMessage.from_dict(response.json())

        return response_400
    if response.status_code == 401:
        response_401 = ErrorMessage.from_dict(response.json())

        return response_401
    if response.status_code == 500:
        response_500 = ErrorMessage.from_dict(response.json())

        return response_500
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[EntityLookupResponse, ErrorMessage]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    body: EntityLookupRequest,
) -> Response[Union[EntityLookupResponse, ErrorMessage]]:
    """Call - Entity lookup

     Lookup an entity from its business ID. Creates the entity if missing.

    Args:
        body (EntityLookupRequest): Request schema for entity lookup operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[EntityLookupResponse, ErrorMessage]]
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
    body: EntityLookupRequest,
) -> Optional[Union[EntityLookupResponse, ErrorMessage]]:
    """Call - Entity lookup

     Lookup an entity from its business ID. Creates the entity if missing.

    Args:
        body (EntityLookupRequest): Request schema for entity lookup operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[EntityLookupResponse, ErrorMessage]
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    body: EntityLookupRequest,
) -> Response[Union[EntityLookupResponse, ErrorMessage]]:
    """Call - Entity lookup

     Lookup an entity from its business ID. Creates the entity if missing.

    Args:
        body (EntityLookupRequest): Request schema for entity lookup operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[EntityLookupResponse, ErrorMessage]]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    body: EntityLookupRequest,
) -> Optional[Union[EntityLookupResponse, ErrorMessage]]:
    """Call - Entity lookup

     Lookup an entity from its business ID. Creates the entity if missing.

    Args:
        body (EntityLookupRequest): Request schema for entity lookup operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[EntityLookupResponse, ErrorMessage]
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
