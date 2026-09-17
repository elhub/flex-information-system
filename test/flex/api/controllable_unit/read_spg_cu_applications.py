from http import HTTPStatus
from typing import Any
from urllib.parse import quote

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.error_message import ErrorMessage
from ...models.service_providing_group_controllable_units_applications_response import (
    ServiceProvidingGroupControllableUnitsApplicationsResponse,
)
from ...types import Response


def _get_kwargs(
    spg_id: int,
) -> dict[str, Any]:

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/service_providing_groups/{spg_id}/controllable_units/applications".format(
            spg_id=quote(str(spg_id), safe=""),
        ),
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse] | None:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = ServiceProvidingGroupControllableUnitsApplicationsResponse.from_dict(
                response_200_item_data
            )

            response_200.append(response_200_item)

        return response_200

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
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    spg_id: int,
    *,
    client: AuthenticatedClient,
) -> Response[ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse]]:
    """Read applications for each controllable unit in a service providing group

    Args:
        spg_id (int):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse]]
    """

    kwargs = _get_kwargs(
        spg_id=spg_id,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    spg_id: int,
    *,
    client: AuthenticatedClient,
) -> ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse] | None:
    """Read applications for each controllable unit in a service providing group

    Args:
        spg_id (int):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse]
    """

    return sync_detailed(
        spg_id=spg_id,
        client=client,
    ).parsed


async def asyncio_detailed(
    spg_id: int,
    *,
    client: AuthenticatedClient,
) -> Response[ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse]]:
    """Read applications for each controllable unit in a service providing group

    Args:
        spg_id (int):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse]]
    """

    kwargs = _get_kwargs(
        spg_id=spg_id,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    spg_id: int,
    *,
    client: AuthenticatedClient,
) -> ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse] | None:
    """Read applications for each controllable unit in a service providing group

    Args:
        spg_id (int):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        ErrorMessage | list[ServiceProvidingGroupControllableUnitsApplicationsResponse]
    """

    return (
        await asyncio_detailed(
            spg_id=spg_id,
            client=client,
        )
    ).parsed
