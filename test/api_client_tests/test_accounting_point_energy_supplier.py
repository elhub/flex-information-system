from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AccountingPointEnergySupplierResponse,
)
from flex.api.accounting_point_energy_supplier import (
    list_accounting_point_energy_supplier,
)
from typing import cast
from datetime import datetime

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


# RLS: APES-SP001
def test_apes_sp(sts):
    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # As AP-ES is read-only, our tests are forced to be quite manual there.

    # In test data, SP manages CUs on APs 1001-1003:
    #   on whole July 2024, not August, then from September 2024 onwards

    # In test data, these APs have the following ESs:
    # - Common ES until 2024-01-01
    # - then Test ES until 2099-01-01

    apess = list_accounting_point_energy_supplier.sync(client=client_sp)
    assert isinstance(apess, list)
    assert len(apess) > 0

    apess_ap = sorted(
        [
            cast(AccountingPointEnergySupplierResponse, apes)
            for apes in apess
            if apes.accounting_point_id == 1003
        ],
        key=lambda apbrp: str(apbrp.valid_from),
    )

    # We check that:

    # - Common ES is never visible because it stops before SP has CU
    common_es_id = sts.get_userinfo(sts.get_client(TestEntity.COMMON, "ES"))["party_id"]
    assert all(apes.energy_supplier_id != common_es_id for apes in apess_ap)

    # - the second AP-ES is cut before July (because SP has no CU before then)
    apes0_start = datetime.fromisoformat(str(apess_ap[0].valid_from)).astimezone(
        tz=None
    )
    assert apes0_start.month == 7
    assert apes0_start.day == 1

    # - the second AP-ES is cut into 2 records, so that SP is blind in August
    assert apess_ap[0].energy_supplier_id == apess_ap[1].energy_supplier_id
    apes0_end = datetime.fromisoformat(str(apess_ap[0].valid_to)).astimezone(tz=None)
    assert apes0_end.month == 8
    assert apes0_end.day == 1
    apes1_start = datetime.fromisoformat(str(apess_ap[1].valid_from)).astimezone(
        tz=None
    )
    assert apes1_start.month == 9
    assert apes1_start.day == 1

    # - the end date of the last AP-ES is not shown (too far in the future)
    assert apess_ap[1].valid_to is None
