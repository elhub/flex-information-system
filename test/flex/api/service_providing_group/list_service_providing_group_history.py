from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union, cast

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    id: Union[Unset, str] = UNSET,
    service_providing_group_id: Union[Unset, str] = UNSET,
) -> Dict[str, Any]:
    params: Dict[str, Any] = {}

    params["id"] = id

    params["service_providing_group_id"] = service_providing_group_id

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": "/service_providing_group_history",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[
    Union[Any, ErrorMessage, List["ServiceProvidingGroupHistoryResponse"], Union["EmptyObject", "ErrorMessage"]]
]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = ServiceProvidingGroupHistoryResponse.from_dict(response_200_item_data)

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
) -> Response[
    Union[Any, ErrorMessage, List["ServiceProvidingGroupHistoryResponse"], Union["EmptyObject", "ErrorMessage"]]
]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: Union[AuthenticatedClient, Client],
    id: Union[Unset, str] = UNSET,
    service_providing_group_id: Union[Unset, str] = UNSET,
) -> Response[
    Union[Any, ErrorMessage, List["ServiceProvidingGroupHistoryResponse"], Union["EmptyObject", "ErrorMessage"]]
]:
    """List Service providing group - history

    Args:
        id (Union[Unset, str]):
        service_providing_group_id (Union[Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, ErrorMessage, List['ServiceProvidingGroupHistoryResponse'], Union['EmptyObject', 'ErrorMessage']]]
    """

    kwargs = _get_kwargs(
        id=id,
        service_providing_group_id=service_providing_group_id,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: Union[AuthenticatedClient, Client],
    id: Union[Unset, str] = UNSET,
    service_providing_group_id: Union[Unset, str] = UNSET,
) -> Optional[
    Union[Any, ErrorMessage, List["ServiceProvidingGroupHistoryResponse"], Union["EmptyObject", "ErrorMessage"]]
]:
    """List Service providing group - history

    Args:
        id (Union[Unset, str]):
        service_providing_group_id (Union[Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, ErrorMessage, List['ServiceProvidingGroupHistoryResponse'], Union['EmptyObject', 'ErrorMessage']]
    """

    return sync_detailed(
        client=client,
        id=id,
        service_providing_group_id=service_providing_group_id,
    ).parsed


async def asyncio_detailed(
    *,
    client: Union[AuthenticatedClient, Client],
    id: Union[Unset, str] = UNSET,
    service_providing_group_id: Union[Unset, str] = UNSET,
) -> Response[
    Union[Any, ErrorMessage, List["ServiceProvidingGroupHistoryResponse"], Union["EmptyObject", "ErrorMessage"]]
]:
    """List Service providing group - history

    Args:
        id (Union[Unset, str]):
        service_providing_group_id (Union[Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, ErrorMessage, List['ServiceProvidingGroupHistoryResponse'], Union['EmptyObject', 'ErrorMessage']]]
    """

    kwargs = _get_kwargs(
        id=id,
        service_providing_group_id=service_providing_group_id,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: Union[AuthenticatedClient, Client],
    id: Union[Unset, str] = UNSET,
    service_providing_group_id: Union[Unset, str] = UNSET,
) -> Optional[
    Union[Any, ErrorMessage, List["ServiceProvidingGroupHistoryResponse"], Union["EmptyObject", "ErrorMessage"]]
]:
    """List Service providing group - history

    Args:
        id (Union[Unset, str]):
        service_providing_group_id (Union[Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, ErrorMessage, List['ServiceProvidingGroupHistoryResponse'], Union['EmptyObject', 'ErrorMessage']]
    """

    return (
        await asyncio_detailed(
            client=client,
            id=id,
            service_providing_group_id=service_providing_group_id,
        )
    ).parsed
