from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.service_provider_product_application_comment_create_request import (
    ServiceProviderProductApplicationCommentCreateRequest,
)
from ...models.service_provider_product_application_comment_response import (
    ServiceProviderProductApplicationCommentResponse,
)
from ...types import Response


def _get_kwargs(
    *,
    body: ServiceProviderProductApplicationCommentCreateRequest,
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": "/service_provider_product_application_comment",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[
    Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union["EmptyObject", "ErrorMessage"]]
]:
    if response.status_code == 201:
        response_201 = ServiceProviderProductApplicationCommentResponse.from_dict(response.json())

        return response_201
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
    if response.status_code == 409:
        response_409 = ErrorMessage.from_dict(response.json())

        return response_409
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
    Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union["EmptyObject", "ErrorMessage"]]
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
    body: ServiceProviderProductApplicationCommentCreateRequest,
) -> Response[
    Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union["EmptyObject", "ErrorMessage"]]
]:
    """Create Service Provider Product Application Comment

    Args:
        body (ServiceProviderProductApplicationCommentCreateRequest): Request schema for create
            operations - Comment made by a party involved in a service provider product application.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union['EmptyObject', 'ErrorMessage']]]
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
    body: ServiceProviderProductApplicationCommentCreateRequest,
) -> Optional[
    Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union["EmptyObject", "ErrorMessage"]]
]:
    """Create Service Provider Product Application Comment

    Args:
        body (ServiceProviderProductApplicationCommentCreateRequest): Request schema for create
            operations - Comment made by a party involved in a service provider product application.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union['EmptyObject', 'ErrorMessage']]
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: Union[AuthenticatedClient, Client],
    body: ServiceProviderProductApplicationCommentCreateRequest,
) -> Response[
    Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union["EmptyObject", "ErrorMessage"]]
]:
    """Create Service Provider Product Application Comment

    Args:
        body (ServiceProviderProductApplicationCommentCreateRequest): Request schema for create
            operations - Comment made by a party involved in a service provider product application.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union['EmptyObject', 'ErrorMessage']]]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: Union[AuthenticatedClient, Client],
    body: ServiceProviderProductApplicationCommentCreateRequest,
) -> Optional[
    Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union["EmptyObject", "ErrorMessage"]]
]:
    """Create Service Provider Product Application Comment

    Args:
        body (ServiceProviderProductApplicationCommentCreateRequest): Request schema for create
            operations - Comment made by a party involved in a service provider product application.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ErrorMessage, ServiceProviderProductApplicationCommentResponse, Union['EmptyObject', 'ErrorMessage']]
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
