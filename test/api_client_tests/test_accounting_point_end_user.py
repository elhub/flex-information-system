from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import AccountingPointEndUserResponse
from flex.api.accounting_point_end_user import (
    list_accounting_point_end_user,
)

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APEU-FISO001
def test_accounting_point_end_user_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /accounting_point_end_user
    apeu = list_accounting_point_end_user.sync(
        client=client_fiso,
        limit="10000",
    )
    assert isinstance(apeu, list)
    assert len(apeu) >= 6000
    assert isinstance(apeu[0], AccountingPointEndUserResponse)


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "SO", "SP", "TP"]

    for role in roles_without_rla:
        apeu = list_accounting_point_end_user.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(apeu, list)
        assert len(apeu) == 0
