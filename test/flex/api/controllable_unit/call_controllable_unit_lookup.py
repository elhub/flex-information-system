from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.controllable_unit_lookup_request import ControllableUnitLookupRequest
from ...models.controllable_unit_lookup_response_item import ControllableUnitLookupResponseItem
from ...models.error_message import ErrorMessage
from ...types import Response


def _get_kwargs(
    *,
    body: ControllableUnitLookupRequest,
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": "/controllable_unit/lookup",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[ErrorMessage, List["ControllableUnitLookupResponseItem"]]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for componentsschemascontrollable_unit_lookup_response_item_data in _response_200:
            componentsschemascontrollable_unit_lookup_response_item = ControllableUnitLookupResponseItem.from_dict(
                componentsschemascontrollable_unit_lookup_response_item_data
            )

            response_200.append(componentsschemascontrollable_unit_lookup_response_item)

        return response_200
    if response.status_code == 400:
        response_400 = ErrorMessage.from_dict(response.json())

        return response_400
    if response.status_code == 401:
        response_401 = ErrorMessage.from_dict(response.json())

        return response_401
    if response.status_code == 404:
        response_404 = ErrorMessage.from_dict(response.json())

        return response_404
    if response.status_code == 500:
        response_500 = ErrorMessage.from_dict(response.json())

        return response_500
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[ErrorMessage, List["ControllableUnitLookupResponseItem"]]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: Union[AuthenticatedClient, Client],
    body: ControllableUnitLookupRequest,
) -> Response[Union[ErrorMessage, List["ControllableUnitLookupResponseItem"]]]:
    """Call - Controllable unit lookup

     Lookup a controllable unit from end user ID and business and/or accounting point ID.

    Args:
        body (ControllableUnitLookupRequest): Request schema for controllable unit lookup
            operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ErrorMessage, List['ControllableUnitLookupResponseItem']]]
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
    client: Union[AuthenticatedClient, Client],
    body: ControllableUnitLookupRequest,
) -> Optional[Union[ErrorMessage, List["ControllableUnitLookupResponseItem"]]]:
    """Call - Controllable unit lookup

     Lookup a controllable unit from end user ID and business and/or accounting point ID.

    Args:
        body (ControllableUnitLookupRequest): Request schema for controllable unit lookup
            operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ErrorMessage, List['ControllableUnitLookupResponseItem']]
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: Union[AuthenticatedClient, Client],
    body: ControllableUnitLookupRequest,
) -> Response[Union[ErrorMessage, List["ControllableUnitLookupResponseItem"]]]:
    """Call - Controllable unit lookup

     Lookup a controllable unit from end user ID and business and/or accounting point ID.

    Args:
        body (ControllableUnitLookupRequest): Request schema for controllable unit lookup
            operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ErrorMessage, List['ControllableUnitLookupResponseItem']]]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: Union[AuthenticatedClient, Client],
    body: ControllableUnitLookupRequest,
) -> Optional[Union[ErrorMessage, List["ControllableUnitLookupResponseItem"]]]:
    """Call - Controllable unit lookup

     Lookup a controllable unit from end user ID and business and/or accounting point ID.

    Args:
        body (ControllableUnitLookupRequest): Request schema for controllable unit lookup
            operations

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ErrorMessage, List['ControllableUnitLookupResponseItem']]
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
