from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import AccountingPointResponse, ErrorMessage
from flex.api.accounting_point import list_accounting_point

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: AP-COM001
def test_accounting_point_common(sts):
    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        ap = list_accounting_point.sync(
            client=client, business_id="eq.133700000000010014"
        )
        assert isinstance(ap, list)
        assert len(ap) == 1
        assert isinstance(ap[0], AccountingPointResponse)


def test_accounting_point_anon(sts):
    client = sts.get_client()

    ap = list_accounting_point.sync(client=client, business_id="eq.133700000000010014")
    assert isinstance(ap, ErrorMessage)
    assert ap.message.startswith("permission denied")
