from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AccountingPointBalanceResponsibleParty,
    AccountingPointBalanceResponsiblePartyEnergyDirection,
)
from flex.api.accounting_point_balance_responsible_party import (
    list_accounting_point_balance_responsible_party,
)
from typing import cast
from datetime import datetime

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APBRP-FISO001
def test_apbrp_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # check they can read all APBRP

    # check a few random paginations and check we always get as many results as
    # the limit we set

    # endpoint: GET /accounting_point_balance_responsible_party
    for offset in ["0", "1000", "3000", "5000"]:
        apbrps = list_accounting_point_balance_responsible_party.sync(
            client=client_fiso,
            offset=offset,
            limit="100",
        )
        assert isinstance(apbrps, list)
        assert len(apbrps) == 100


# RLS: APBRP-SO001
def test_apbrp_so(sts):
    client_so = sts.get_client(TestEntity.TEST, "SO")

    # test APs are in Test SO's MGA between 1000 and 2000

    for ap_id in [1001, 1500, 1999]:
        apbrp = list_accounting_point_balance_responsible_party.sync(
            client=client_so,
            accounting_point_id=f"eq.{ap_id}",
        )
        assert isinstance(apbrp, list)
        assert len(apbrp) > 0


# RLS: APBRP-SP001
def test_apbrp_sp(sts):
    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # As AP-BRP is read-only, our tests are forced to be quite manual there.

    # In test data, SP manages CUs on APs 1001-1003:
    #   on whole July 2024, not August, then from September 2024 onwards

    # In test data, these APs have the following BRPs:
    # - Test BRP until 2024-07-20
    # - then Common BRP until 2024-09-10
    # - then Test BRP until 2099-01-01 (far in the future)

    apbrps = list_accounting_point_balance_responsible_party.sync(
        client=client_sp,
    )
    assert isinstance(apbrps, list)
    assert len(apbrps) > 0

    apbrps_ap = sorted(
        [
            cast(AccountingPointBalanceResponsiblePartyResponse, apbrp)
            for apbrp in apbrps
            if apbrp.accounting_point_id == 1003
            and apbrp.energy_direction
            == AccountingPointBalanceResponsiblePartyEnergyDirection.PRODUCTION
        ],
        key=lambda apbrp: str(apbrp.valid_from),
    )

    # We check that:

    # - the first AP-BRP is cut before July (because SP has no CU before then)
    apbrp0_start = datetime.fromisoformat(str(apbrps_ap[0].valid_from)).astimezone(
        tz=None
    )
    assert apbrp0_start.month == 7
    assert apbrp0_start.day == 1

    # - the second AP-BRP is cut into 2 records, so that SP is blind in August
    assert (
        apbrps_ap[1].balance_responsible_party_id
        == apbrps_ap[2].balance_responsible_party_id
    )
    apbrp1_end = datetime.fromisoformat(str(apbrps_ap[1].valid_to)).astimezone(tz=None)
    assert apbrp1_end.month == 8
    assert apbrp1_end.day == 1
    apbrp2_start = datetime.fromisoformat(str(apbrps_ap[2].valid_from)).astimezone(
        tz=None
    )
    assert apbrp2_start.month == 9
    assert apbrp2_start.day == 1

    # - the end date of the third AP-BRP is not shown (too far in the future)
    assert apbrps_ap[3].valid_to is None
