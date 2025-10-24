from http import HTTPStatus
from typing import Any, Union, cast

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.empty_object import EmptyObject
from ...models.error_message import ErrorMessage
from ...models.service_provider_product_suspension_response import ServiceProviderProductSuspensionResponse
from ...models.service_provider_product_suspension_update_request import ServiceProviderProductSuspensionUpdateRequest
from ...types import Response


def _get_kwargs(
    id: int,
    *,
    body: ServiceProviderProductSuspensionUpdateRequest,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "patch",
        "url": f"/service_provider_product_suspension/{id}",
    }

    _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union["EmptyObject", "ErrorMessage"]] | None:
    if response.status_code == 200:
        response_200 = ServiceProviderProductSuspensionResponse.from_dict(response.json())

        return response_200

    if response.status_code == 204:
        response_204 = cast(Any, None)
        return response_204

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

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union["EmptyObject", "ErrorMessage"]]]:
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
    body: ServiceProviderProductSuspensionUpdateRequest,
) -> Response[Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union["EmptyObject", "ErrorMessage"]]]:
    """Update Service Provider Product Suspension

    Args:
        id (int):
        body (ServiceProviderProductSuspensionUpdateRequest): Request schema for update operations
            - The relation allowing a procuring system operator to temporarily suspend a service
            provider from delivering them products of the given types.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union['EmptyObject', 'ErrorMessage']]]
    """

    kwargs = _get_kwargs(
        id=id,
        body=body,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    id: int,
    *,
    client: AuthenticatedClient,
    body: ServiceProviderProductSuspensionUpdateRequest,
) -> Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union["EmptyObject", "ErrorMessage"]] | None:
    """Update Service Provider Product Suspension

    Args:
        id (int):
        body (ServiceProviderProductSuspensionUpdateRequest): Request schema for update operations
            - The relation allowing a procuring system operator to temporarily suspend a service
            provider from delivering them products of the given types.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union['EmptyObject', 'ErrorMessage']]
    """

    return sync_detailed(
        id=id,
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    id: int,
    *,
    client: AuthenticatedClient,
    body: ServiceProviderProductSuspensionUpdateRequest,
) -> Response[Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union["EmptyObject", "ErrorMessage"]]]:
    """Update Service Provider Product Suspension

    Args:
        id (int):
        body (ServiceProviderProductSuspensionUpdateRequest): Request schema for update operations
            - The relation allowing a procuring system operator to temporarily suspend a service
            provider from delivering them products of the given types.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union['EmptyObject', 'ErrorMessage']]]
    """

    kwargs = _get_kwargs(
        id=id,
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    id: int,
    *,
    client: AuthenticatedClient,
    body: ServiceProviderProductSuspensionUpdateRequest,
) -> Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union["EmptyObject", "ErrorMessage"]] | None:
    """Update Service Provider Product Suspension

    Args:
        id (int):
        body (ServiceProviderProductSuspensionUpdateRequest): Request schema for update operations
            - The relation allowing a procuring system operator to temporarily suspend a service
            provider from delivering them products of the given types.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, ErrorMessage, ServiceProviderProductSuspensionResponse, Union['EmptyObject', 'ErrorMessage']]
    """

    return (
        await asyncio_detailed(
            id=id,
            client=client,
            body=body,
        )
    ).parsed
