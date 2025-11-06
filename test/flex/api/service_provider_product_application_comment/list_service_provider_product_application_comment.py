from http import HTTPStatus
from typing import Any, cast

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.list_service_provider_product_application_comment_prefer import (
    ListServiceProviderProductApplicationCommentPrefer,
)
from ...models.service_provider_product_application_comment_response import (
    ServiceProviderProductApplicationCommentResponse,
)
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    id: str | Unset = UNSET,
    service_provider_product_application_id: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    range_: str | Unset = UNSET,
    range_unit: str | Unset = UNSET,
    prefer: ListServiceProviderProductApplicationCommentPrefer | Unset = UNSET,
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

    params["service_provider_product_application_id"] = service_provider_product_application_id

    params["select"] = select

    params["order"] = order

    params["offset"] = offset

    params["limit"] = limit

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/service_provider_product_application_comment",
        "params": params,
    }

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse] | None:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = ServiceProviderProductApplicationCommentResponse.from_dict(response_200_item_data)

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
) -> Response[Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    id: str | Unset = UNSET,
    service_provider_product_application_id: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    range_: str | Unset = UNSET,
    range_unit: str | Unset = UNSET,
    prefer: ListServiceProviderProductApplicationCommentPrefer | Unset = UNSET,
) -> Response[Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse]]:
    """List Service Provider Product Application Comment

    Args:
        id (str | Unset):
        service_provider_product_application_id (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        range_ (str | Unset):
        range_unit (str | Unset):
        prefer (ListServiceProviderProductApplicationCommentPrefer | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse]]
    """

    kwargs = _get_kwargs(
        id=id,
        service_provider_product_application_id=service_provider_product_application_id,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
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
    id: str | Unset = UNSET,
    service_provider_product_application_id: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    range_: str | Unset = UNSET,
    range_unit: str | Unset = UNSET,
    prefer: ListServiceProviderProductApplicationCommentPrefer | Unset = UNSET,
) -> Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse] | None:
    """List Service Provider Product Application Comment

    Args:
        id (str | Unset):
        service_provider_product_application_id (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        range_ (str | Unset):
        range_unit (str | Unset):
        prefer (ListServiceProviderProductApplicationCommentPrefer | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse]
    """

    return sync_detailed(
        client=client,
        id=id,
        service_provider_product_application_id=service_provider_product_application_id,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        range_=range_,
        range_unit=range_unit,
        prefer=prefer,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    id: str | Unset = UNSET,
    service_provider_product_application_id: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    range_: str | Unset = UNSET,
    range_unit: str | Unset = UNSET,
    prefer: ListServiceProviderProductApplicationCommentPrefer | Unset = UNSET,
) -> Response[Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse]]:
    """List Service Provider Product Application Comment

    Args:
        id (str | Unset):
        service_provider_product_application_id (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        range_ (str | Unset):
        range_unit (str | Unset):
        prefer (ListServiceProviderProductApplicationCommentPrefer | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse]]
    """

    kwargs = _get_kwargs(
        id=id,
        service_provider_product_application_id=service_provider_product_application_id,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        range_=range_,
        range_unit=range_unit,
        prefer=prefer,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    id: str | Unset = UNSET,
    service_provider_product_application_id: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    range_: str | Unset = UNSET,
    range_unit: str | Unset = UNSET,
    prefer: ListServiceProviderProductApplicationCommentPrefer | Unset = UNSET,
) -> Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse] | None:
    """List Service Provider Product Application Comment

    Args:
        id (str | Unset):
        service_provider_product_application_id (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        range_ (str | Unset):
        range_unit (str | Unset):
        prefer (ListServiceProviderProductApplicationCommentPrefer | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Any | EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProviderProductApplicationCommentResponse]
    """

    return (
        await asyncio_detailed(
            client=client,
            id=id,
            service_provider_product_application_id=service_provider_product_application_id,
            select=select,
            order=order,
            offset=offset,
            limit=limit,
            range_=range_,
            range_unit=range_unit,
            prefer=prefer,
        )
    ).parsed
