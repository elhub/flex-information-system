from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.service_providing_group_product_suspension_history_response import (
    ServiceProvidingGroupProductSuspensionHistoryResponse,
)
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    id: str | Unset = UNSET,
    procuring_system_operator_id: str | Unset = UNSET,
    service_providing_group_id: str | Unset = UNSET,
    product_type_ids: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    service_providing_group_product_suspension_id: str | Unset = UNSET,
) -> dict[str, Any]:

    params: dict[str, Any] = {}

    params["id"] = id

    params["procuring_system_operator_id"] = procuring_system_operator_id

    params["service_providing_group_id"] = service_providing_group_id

    params["product_type_ids"] = product_type_ids

    params["select"] = select

    params["order"] = order

    params["offset"] = offset

    params["limit"] = limit

    params["service_providing_group_product_suspension_id"] = service_providing_group_product_suspension_id

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/service_providing_group_product_suspension_history",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse] | None:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = ServiceProvidingGroupProductSuspensionHistoryResponse.from_dict(response_200_item_data)

            response_200.append(response_200_item)

        return response_200

    if response.status_code == 206:
        response_206 = []
        _response_206 = response.json()
        for response_206_item_data in _response_206:
            response_206_item = ServiceProvidingGroupProductSuspensionHistoryResponse.from_dict(response_206_item_data)

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
) -> Response[EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse]]:
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
    procuring_system_operator_id: str | Unset = UNSET,
    service_providing_group_id: str | Unset = UNSET,
    product_type_ids: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    service_providing_group_product_suspension_id: str | Unset = UNSET,
) -> Response[EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse]]:
    """List Service Providing Group Product Suspension - history

    Args:
        id (str | Unset):
        procuring_system_operator_id (str | Unset):
        service_providing_group_id (str | Unset):
        product_type_ids (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        service_providing_group_product_suspension_id (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse]]
    """

    kwargs = _get_kwargs(
        id=id,
        procuring_system_operator_id=procuring_system_operator_id,
        service_providing_group_id=service_providing_group_id,
        product_type_ids=product_type_ids,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient,
    id: str | Unset = UNSET,
    procuring_system_operator_id: str | Unset = UNSET,
    service_providing_group_id: str | Unset = UNSET,
    product_type_ids: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    service_providing_group_product_suspension_id: str | Unset = UNSET,
) -> EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse] | None:
    """List Service Providing Group Product Suspension - history

    Args:
        id (str | Unset):
        procuring_system_operator_id (str | Unset):
        service_providing_group_id (str | Unset):
        product_type_ids (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        service_providing_group_product_suspension_id (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse]
    """

    return sync_detailed(
        client=client,
        id=id,
        procuring_system_operator_id=procuring_system_operator_id,
        service_providing_group_id=service_providing_group_id,
        product_type_ids=product_type_ids,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    id: str | Unset = UNSET,
    procuring_system_operator_id: str | Unset = UNSET,
    service_providing_group_id: str | Unset = UNSET,
    product_type_ids: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    service_providing_group_product_suspension_id: str | Unset = UNSET,
) -> Response[EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse]]:
    """List Service Providing Group Product Suspension - history

    Args:
        id (str | Unset):
        procuring_system_operator_id (str | Unset):
        service_providing_group_id (str | Unset):
        product_type_ids (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        service_providing_group_product_suspension_id (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse]]
    """

    kwargs = _get_kwargs(
        id=id,
        procuring_system_operator_id=procuring_system_operator_id,
        service_providing_group_id=service_providing_group_id,
        product_type_ids=product_type_ids,
        select=select,
        order=order,
        offset=offset,
        limit=limit,
        service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    id: str | Unset = UNSET,
    procuring_system_operator_id: str | Unset = UNSET,
    service_providing_group_id: str | Unset = UNSET,
    product_type_ids: str | Unset = UNSET,
    select: str | Unset = UNSET,
    order: str | Unset = UNSET,
    offset: str | Unset = UNSET,
    limit: str | Unset = UNSET,
    service_providing_group_product_suspension_id: str | Unset = UNSET,
) -> EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse] | None:
    """List Service Providing Group Product Suspension - history

    Args:
        id (str | Unset):
        procuring_system_operator_id (str | Unset):
        service_providing_group_id (str | Unset):
        product_type_ids (str | Unset):
        select (str | Unset):
        order (str | Unset):
        offset (str | Unset):
        limit (str | Unset):
        service_providing_group_product_suspension_id (str | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        EmptyObject | ErrorMessage | ErrorMessage | list[ServiceProvidingGroupProductSuspensionHistoryResponse]
    """

    return (
        await asyncio_detailed(
            client=client,
            id=id,
            procuring_system_operator_id=procuring_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            product_type_ids=product_type_ids,
            select=select,
            order=order,
            offset=offset,
            limit=limit,
            service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
        )
    ).parsed
