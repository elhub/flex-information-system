from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import ProductType, ErrorMessage
from flex.api.product_type import (
    list_product_type,
    read_product_type,
)
from typing import cast

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: PT-COM001
def test_product_type_common(sts):
    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # endpoint: GET /product_type
        pts = list_product_type.sync(client=client)
        assert isinstance(pts, list)
        assert len(pts) > 0

        # endpoint: GET /product_type/{id}
        pt = read_product_type.sync(client=client, id=cast(int, pts[0].id))
        assert isinstance(pt, ProductType)


def test_product_type_anon(sts):
    client = sts.get_client()

    pts = list_product_type.sync(client=client)
    assert isinstance(pts, ErrorMessage)


def test_product_type_ent(sts):
    client_ent = sts.get_client(TestEntity.TEST)

    pts = list_product_type.sync(client=client_ent)
    assert isinstance(pts, ErrorMessage)
