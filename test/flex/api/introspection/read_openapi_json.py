from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.error_message import ErrorMessage
from ...models.read_openapi_json_response_200 import ReadOpenapiJsonResponse200
from ...types import Response


def _get_kwargs() -> Dict[str, Any]:
    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": "/openapi.json",
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[ErrorMessage, ReadOpenapiJsonResponse200]]:
    if response.status_code == 200:
        response_200 = ReadOpenapiJsonResponse200.from_dict(response.json())

        return response_200
    if response.status_code == 400:
        response_400 = ErrorMessage.from_dict(response.json())

        return response_400
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[ErrorMessage, ReadOpenapiJsonResponse200]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: Union[AuthenticatedClient, Client],
) -> Response[Union[ErrorMessage, ReadOpenapiJsonResponse200]]:
    """Read OpenAPI JSON Document

     Introspection for the Flexibility Information System main API. The document is following the OpenAPI
    3.1 spec.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ErrorMessage, ReadOpenapiJsonResponse200]]
    """

    kwargs = _get_kwargs()

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[Union[ErrorMessage, ReadOpenapiJsonResponse200]]:
    """Read OpenAPI JSON Document

     Introspection for the Flexibility Information System main API. The document is following the OpenAPI
    3.1 spec.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ErrorMessage, ReadOpenapiJsonResponse200]
    """

    return sync_detailed(
        client=client,
    ).parsed


async def asyncio_detailed(
    *,
    client: Union[AuthenticatedClient, Client],
) -> Response[Union[ErrorMessage, ReadOpenapiJsonResponse200]]:
    """Read OpenAPI JSON Document

     Introspection for the Flexibility Information System main API. The document is following the OpenAPI
    3.1 spec.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ErrorMessage, ReadOpenapiJsonResponse200]]
    """

    kwargs = _get_kwargs()

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[Union[ErrorMessage, ReadOpenapiJsonResponse200]]:
    """Read OpenAPI JSON Document

     Introspection for the Flexibility Information System main API. The document is following the OpenAPI
    3.1 spec.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ErrorMessage, ReadOpenapiJsonResponse200]
    """

    return (
        await asyncio_detailed(
            client=client,
        )
    ).parsed
