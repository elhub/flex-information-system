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
    for offset in ["0", "1000", "3000"]:
        apess = list_accounting_point_energy_supplier.sync(
            client=client_fiso,
            offset=offset,
            limit="100",
        )
        assert isinstance(apess, list)
        assert len(apess) == 100


# RLS: APES-SO001
def test_apes_so(sts):
    client_so = sts.get_client(TestEntity.TEST, "SO")

    # test APs are in Test SO's MGA between 1000 and 2000

    for ap_id in [1001, 1500, 1999]:
        apes = list_accounting_point_energy_supplier.sync(
            client=client_so,
            accounting_point_id=f"eq.{ap_id}",
        )
        assert isinstance(apes, list)
        assert len(apes) > 0


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "SP", "TP"]

    for role in roles_without_rla:
        spgs = list_accounting_point_energy_supplier.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(spgs, list)
        assert len(spgs) == 0
