from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.accounting_point_balance_responsible_party_response import AccountingPointBalanceResponsiblePartyResponse
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    accounting_point_id: str | Unset = UNSET,
    balance_responsible_party_id: str | Unset = UNSET,
    valid_from: str | Unset = UNSET,
    valid_to: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
) -> dict[str, Any]:

    params: dict[str, Any] = {}

    params["accounting_point_id"] = accounting_point_id

    params["balance_responsible_party_id"] = balance_responsible_party_id

    params["valid_from"] = valid_from

    params["valid_to"] = valid_to

    params["select"] = select

    params["order"] = order

    params["offset"] = offset

    params["limit"] = limit

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/accounting_point_balance_responsible_party",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse] | None:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = AccountingPointBalanceResponsiblePartyResponse.from_dict(response_200_item_data)

            response_200.append(response_200_item)

        return response_200

    if response.status_code == 206:
        response_206 = []
        _response_206 = response.json()
        for response_206_item_data in _response_206:
            response_206_item = AccountingPointBalanceResponsiblePartyResponse.from_dict(response_206_item_data)

            response_206.append(response_206_item)

        return response_206

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

    if response.status_code == 416:
        response_416 = ErrorMessage.from_dict(response.json())

        return response_416

    if response.status_code == 500:
        response_500 = ErrorMessage.from_dict(response.json())

        return response_500

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    accounting_point_id: str | Unset = UNSET,
    balance_responsible_party_id: str | Unset = UNSET,
    valid_from: str | Unset = UNSET,
    valid_to: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
) -> Response[EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse]]:
    """List Accounting Point Balance Responsible Party

    Args:
        accounting_point_id (str | Unset):
        balance_responsible_party_id (str | Unset):
        valid_from (str | Unset):
        valid_to (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse]]
    """

    kwargs = _get_kwargs(
        accounting_point_id=accounting_point_id,
        balance_responsible_party_id=balance_responsible_party_id,
        valid_from=valid_from,
        valid_to=valid_to,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient,
    accounting_point_id: str | Unset = UNSET,
    balance_responsible_party_id: str | Unset = UNSET,
    valid_from: str | Unset = UNSET,
    valid_to: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
) -> EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse] | None:
    """List Accounting Point Balance Responsible Party

    Args:
        accounting_point_id (str | Unset):
        balance_responsible_party_id (str | Unset):
        valid_from (str | Unset):
        valid_to (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse]
    """

    return sync_detailed(
        client=client,
        accounting_point_id=accounting_point_id,
        balance_responsible_party_id=balance_responsible_party_id,
        valid_from=valid_from,
        valid_to=valid_to,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    accounting_point_id: str | Unset = UNSET,
    balance_responsible_party_id: str | Unset = UNSET,
    valid_from: str | Unset = UNSET,
    valid_to: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
) -> Response[EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse]]:
    """List Accounting Point Balance Responsible Party

    Args:
        accounting_point_id (str | Unset):
        balance_responsible_party_id (str | Unset):
        valid_from (str | Unset):
        valid_to (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse]]
    """

    kwargs = _get_kwargs(
        accounting_point_id=accounting_point_id,
        balance_responsible_party_id=balance_responsible_party_id,
        valid_from=valid_from,
        valid_to=valid_to,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    accounting_point_id: str | Unset = UNSET,
    balance_responsible_party_id: str | Unset = UNSET,
    valid_from: str | Unset = UNSET,
    valid_to: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
) -> EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse] | None:
    """List Accounting Point Balance Responsible Party

    Args:
        accounting_point_id (str | Unset):
        balance_responsible_party_id (str | Unset):
        valid_from (str | Unset):
        valid_to (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | ErrorMessage | list[AccountingPointBalanceResponsiblePartyResponse]
    """

    return (
        await asyncio_detailed(
            client=client,
            accounting_point_id=accounting_point_id,
            balance_responsible_party_id=balance_responsible_party_id,
            valid_from=valid_from,
            valid_to=valid_to,
            select=select,
            order=order,
            offset=offset,
            limit=limit,
        )
    ).parsed
