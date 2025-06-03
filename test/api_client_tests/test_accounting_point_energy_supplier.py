from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.api.accounting_point_energy_supplier import (
    list_accounting_point_energy_supplier,
)
import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APES-FISO001
def test_apes_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # check they can read all APES

    # endpoint: GET /accounting_point_energy_supplier
    apess = list_accounting_point_energy_supplier.sync(client=client_fiso)
    assert isinstance(apess, list)
    assert len(apess) == 2000  # all APES in the test data


# RLS: APES-SO001
def test_apes_so(sts):
    client_so = sts.get_client(TestEntity.TEST, "SO")

    # test data is created from one MGA belonging to Test SO

    apess = list_accounting_point_energy_supplier.sync(client=client_so)
    assert isinstance(apess, list)
    assert len(apess) == 2000  # all APES in the test data


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "SP", "TP"]

    for role in roles_without_rla:
        spgs = list_accounting_point_energy_supplier.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(spgs, list)
        assert len(spgs) == 0
