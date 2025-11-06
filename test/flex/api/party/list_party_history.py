from http import HTTPStatus
from typing import Any, Union, cast

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.list_party_history_prefer import ListPartyHistoryPrefer
from ...models.party_history_response import PartyHistoryResponse
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    id: Union[Unset, str] = UNSET,
    entity_id: Union[Unset, str] = UNSET,
    name: Union[Unset, str] = UNSET,
    business_id: Union[Unset, str] = UNSET,
    business_id_type: Union[Unset, str] = UNSET,
    select: Union[Unset, str] = UNSET,
    order: Union[Unset, str] = UNSET,
    offset: Union[Unset, str] = UNSET,
    limit: Union[Unset, str] = UNSET,
    party_id: Union[Unset, str] = UNSET,
    range_: Union[Unset, str] = UNSET,
    range_unit: Union[Unset, str] = UNSET,
    prefer: Union[Unset, ListPartyHistoryPrefer] = UNSET,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}
    if not isinstance(range_, Unset):
        headers["Range"] = range_

    if not isinstance(range_unit, Unset):
        headers["Range-Unit"] = range_unit

    if not isinstance(prefer, Unset):
        headers["Prefer"] = str(prefer)

    params: dict[str, Any] = {}

    params["id"] = id

    params["entity_id"] = entity_id

    params["name"] = name

    params["business_id"] = business_id

    params["business_id_type"] = business_id_type

    params["select"] = select

    params["order"] = order

    params["offset"] = offset

    params["limit"] = limit

    params["party_id"] = party_id

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/party_history",
        "params": params,
    }

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Union[Any, ErrorMessage, Union["EmptyObject", "ErrorMessage"], list["PartyHistoryResponse"]] | None:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = PartyHistoryResponse.from_dict(response_200_item_data)

            response_200.append(response_200_item)

        return response_200

    if response.status_code == 206:
        response_206 = cast(Any, None)
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

        def _parse_response_404(data: object) -> Union["EmptyObject", "ErrorMessage"]:
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                response_404_type_0 = ErrorMessage.from_dict(data)

                return response_404_type_0
            except:  # noqa: E722
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
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[Any, ErrorMessage, Union["EmptyObject", "ErrorMessage"], list["PartyHistoryResponse"]]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    id: Union[Unset, str] = UNSET,
    entity_id: Union[Unset, str] = UNSET,
    name: Union[Unset, str] = UNSET,
    business_id: Union[Unset, str] = UNSET,
    business_id_type: Union[Unset, str] = UNSET,
    select: Union[Unset, str] = UNSET,
    order: Union[Unset, str] = UNSET,
    offset: Union[Unset, str] = UNSET,
    limit: Union[Unset, str] = UNSET,
    party_id: Union[Unset, str] = UNSET,
    range_: Union[Unset, str] = UNSET,
    range_unit: Union[Unset, str] = UNSET,
    prefer: Union[Unset, ListPartyHistoryPrefer] = UNSET,
) -> Response[Union[Any, ErrorMessage, Union["EmptyObject", "ErrorMessage"], list["PartyHistoryResponse"]]]:
    """List Party - history

    Args:
        id (Union[Unset, str]):
        entity_id (Union[Unset, str]):
        name (Union[Unset, str]):
        business_id (Union[Unset, str]):
        business_id_type (Union[Unset, str]):
        select (Union[Unset, str]):
        order (Union[Unset, str]):
        offset (Union[Unset, str]):
        limit (Union[Unset, str]):
        party_id (Union[Unset, str]):
        range_ (Union[Unset, str]):
        range_unit (Union[Unset, str]):
        prefer (Union[Unset, ListPartyHistoryPrefer]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, ErrorMessage, Union['EmptyObject', 'ErrorMessage'], list['PartyHistoryResponse']]]
    """

    kwargs = _get_kwargs(
        id=id,
        entity_id=entity_id,
        name=name,
        business_id=business_id,
        business_id_type=business_id_type,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        party_id=party_id,
        range_=range_,
        range_unit=range_unit,
        prefer=prefer,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient,
    id: Union[Unset, str] = UNSET,
    entity_id: Union[Unset, str] = UNSET,
    name: Union[Unset, str] = UNSET,
    business_id: Union[Unset, str] = UNSET,
    business_id_type: Union[Unset, str] = UNSET,
    select: Union[Unset, str] = UNSET,
    order: Union[Unset, str] = UNSET,
    offset: Union[Unset, str] = UNSET,
    limit: Union[Unset, str] = UNSET,
    party_id: Union[Unset, str] = UNSET,
    range_: Union[Unset, str] = UNSET,
    range_unit: Union[Unset, str] = UNSET,
    prefer: Union[Unset, ListPartyHistoryPrefer] = UNSET,
) -> Union[Any, ErrorMessage, Union["EmptyObject", "ErrorMessage"], list["PartyHistoryResponse"]] | None:
    """List Party - history

    Args:
        id (Union[Unset, str]):
        entity_id (Union[Unset, str]):
        name (Union[Unset, str]):
        business_id (Union[Unset, str]):
        business_id_type (Union[Unset, str]):
        select (Union[Unset, str]):
        order (Union[Unset, str]):
        offset (Union[Unset, str]):
        limit (Union[Unset, str]):
        party_id (Union[Unset, str]):
        range_ (Union[Unset, str]):
        range_unit (Union[Unset, str]):
        prefer (Union[Unset, ListPartyHistoryPrefer]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, ErrorMessage, Union['EmptyObject', 'ErrorMessage'], list['PartyHistoryResponse']]
    """

    return sync_detailed(
        client=client,
        id=id,
        entity_id=entity_id,
        name=name,
        business_id=business_id,
        business_id_type=business_id_type,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        party_id=party_id,
        range_=range_,
        range_unit=range_unit,
        prefer=prefer,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    id: Union[Unset, str] = UNSET,
    entity_id: Union[Unset, str] = UNSET,
    name: Union[Unset, str] = UNSET,
    business_id: Union[Unset, str] = UNSET,
    business_id_type: Union[Unset, str] = UNSET,
    select: Union[Unset, str] = UNSET,
    order: Union[Unset, str] = UNSET,
    offset: Union[Unset, str] = UNSET,
    limit: Union[Unset, str] = UNSET,
    party_id: Union[Unset, str] = UNSET,
    range_: Union[Unset, str] = UNSET,
    range_unit: Union[Unset, str] = UNSET,
    prefer: Union[Unset, ListPartyHistoryPrefer] = UNSET,
) -> Response[Union[Any, ErrorMessage, Union["EmptyObject", "ErrorMessage"], list["PartyHistoryResponse"]]]:
    """List Party - history

    Args:
        id (Union[Unset, str]):
        entity_id (Union[Unset, str]):
        name (Union[Unset, str]):
        business_id (Union[Unset, str]):
        business_id_type (Union[Unset, str]):
        select (Union[Unset, str]):
        order (Union[Unset, str]):
        offset (Union[Unset, str]):
        limit (Union[Unset, str]):
        party_id (Union[Unset, str]):
        range_ (Union[Unset, str]):
        range_unit (Union[Unset, str]):
        prefer (Union[Unset, ListPartyHistoryPrefer]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, ErrorMessage, Union['EmptyObject', 'ErrorMessage'], list['PartyHistoryResponse']]]
    """

    kwargs = _get_kwargs(
        id=id,
        entity_id=entity_id,
        name=name,
        business_id=business_id,
        business_id_type=business_id_type,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        party_id=party_id,
        range_=range_,
        range_unit=range_unit,
        prefer=prefer,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    id: Union[Unset, str] = UNSET,
    entity_id: Union[Unset, str] = UNSET,
    name: Union[Unset, str] = UNSET,
    business_id: Union[Unset, str] = UNSET,
    business_id_type: Union[Unset, str] = UNSET,
    select: Union[Unset, str] = UNSET,
    order: Union[Unset, str] = UNSET,
    offset: Union[Unset, str] = UNSET,
    limit: Union[Unset, str] = UNSET,
    party_id: Union[Unset, str] = UNSET,
    range_: Union[Unset, str] = UNSET,
    range_unit: Union[Unset, str] = UNSET,
    prefer: Union[Unset, ListPartyHistoryPrefer] = UNSET,
) -> Union[Any, ErrorMessage, Union["EmptyObject", "ErrorMessage"], list["PartyHistoryResponse"]] | None:
    """List Party - history

    Args:
        id (Union[Unset, str]):
        entity_id (Union[Unset, str]):
        name (Union[Unset, str]):
        business_id (Union[Unset, str]):
        business_id_type (Union[Unset, str]):
        select (Union[Unset, str]):
        order (Union[Unset, str]):
        offset (Union[Unset, str]):
        limit (Union[Unset, str]):
        party_id (Union[Unset, str]):
        range_ (Union[Unset, str]):
        range_unit (Union[Unset, str]):
        prefer (Union[Unset, ListPartyHistoryPrefer]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, ErrorMessage, Union['EmptyObject', 'ErrorMessage'], list['PartyHistoryResponse']]
    """

    return (
        await asyncio_detailed(
            client=client,
            id=id,
            entity_id=entity_id,
            name=name,
            business_id=business_id,
            business_id_type=business_id_type,
            select=select,
            order=order,
            offset=offset,
            limit=limit,
            party_id=party_id,
            range_=range_,
            range_unit=range_unit,
            prefer=prefer,
        )
    ).parsed
