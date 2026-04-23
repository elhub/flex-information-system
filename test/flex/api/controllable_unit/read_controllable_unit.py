from http import HTTPStatus
from typing import Any
from urllib.parse import quote

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.controllable_unit_response import ControllableUnitResponse
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...types import UNSET, Response, Unset


def _get_kwargs(
    id: int,
    *,
    embed: str | Unset = UNSET,
) -> dict[str, Any]:
    params: dict[str, Any] = {}

    params["embed"] = embed

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/controllable_unit/{id}".format(
            id=quote(str(id), safe=""),
        ),
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage | None:
    if response.status_code == 200:
        response_200 = ControllableUnitResponse.from_dict(response.json())

        return response_200

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

    if response.status_code == 500:
        response_500 = ErrorMessage.from_dict(response.json())

        return response_500

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage]:
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
    embed: str | Unset = UNSET,
) -> Response[ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage]:
    """Read Controllable unit

     Read [Controllable unit](https://elhub.github.io/flex-information-
    system/resources/controllable_unit/)

    Args:
        id (int):
        embed (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage]
    """

    kwargs = _get_kwargs(
        id=id,
        embed=embed,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    id: int,
    *,
    client: AuthenticatedClient,
    embed: str | Unset = UNSET,
) -> ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage | None:
    """Read Controllable unit

     Read [Controllable unit](https://elhub.github.io/flex-information-
    system/resources/controllable_unit/)

    Args:
        id (int):
        embed (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage
    """

    return sync_detailed(
        id=id,
        client=client,
        embed=embed,
    ).parsed


async def asyncio_detailed(
    id: int,
    *,
    client: AuthenticatedClient,
    embed: str | Unset = UNSET,
) -> Response[ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage]:
    """Read Controllable unit

     Read [Controllable unit](https://elhub.github.io/flex-information-
    system/resources/controllable_unit/)

    Args:
        id (int):
        embed (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage]
    """

    kwargs = _get_kwargs(
        id=id,
        embed=embed,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    id: int,
    *,
    client: AuthenticatedClient,
    embed: str | Unset = UNSET,
) -> ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage | None:
    """Read Controllable unit

     Read [Controllable unit](https://elhub.github.io/flex-information-
    system/resources/controllable_unit/)

    Args:
        id (int):
        embed (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        ControllableUnitResponse | EmptyObject | ErrorMessage | ErrorMessage
    """

    return (
        await asyncio_detailed(
            id=id,
            client=client,
            embed=embed,
        )
    ).parsed
