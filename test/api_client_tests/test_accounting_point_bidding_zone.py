from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import AccountingPointBiddingZoneResponse
from flex.api.accounting_point_bidding_zone import (
    list_accounting_point_bidding_zone,
)
from typing import cast
from datetime import datetime

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APBZ-FISO001
def test_accounting_point_bidding_zone_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /accounting_point_bidding_zone
    apbz = list_accounting_point_bidding_zone.sync(
        client=client_fiso,
        limit="10000",
    )
    assert isinstance(apbz, list)
    assert len(apbz) >= 3000
    assert isinstance(apbz[0], AccountingPointBiddingZoneResponse)


# RLS: APBZ-SO001
def test_apbz_so(sts):
    client_so = sts.get_client(TestEntity.TEST, "SO")

    # test APs are in Test SO's MGA between 1000 and 2000

    for ap_id in [1001, 1500, 1999]:
        apbz = list_accounting_point_bidding_zone.sync(
            client=client_so,
            accounting_point_id=f"eq.{ap_id}",
        )
        assert isinstance(apbz, list)
        assert len(apbz) > 0

    # APs outside Test SO's MGA (Common SO's range: 2000-3000) should not be visible
    apbz_outside = list_accounting_point_bidding_zone.sync(
        client=client_so,
        accounting_point_id="eq.2001",
    )
    assert isinstance(apbz_outside, list)
    assert len(apbz_outside) == 0


# RLS: APBZ-SP001
def test_apbz_sp(sts):
    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # In test data, SP manages CUs on APs 1001-1003:
    #   on whole July 2024, not August, then from September 2024 onwards

    # In test data, these APs have bidding zone NO3 from 2023-10-01 onwards
    # (set via metering_grid_area_price_area in test data)

    apbzs = list_accounting_point_bidding_zone.sync(
        client=client_sp,
    )
    assert isinstance(apbzs, list)
    assert len(apbzs) > 0

    apbzs_ap = sorted(
        [
            cast(AccountingPointBiddingZoneResponse, apbz)
            for apbz in apbzs
            if apbz.accounting_point_id == 1003
        ],
        key=lambda apbz: str(apbz.valid_from),
    )

    assert len(apbzs_ap) >= 2, (
        f"Expected at least 2 APBZ records for AP 1003, got {len(apbzs_ap)}"
    )

    # We check that:

    # - the first APBZ starts at July (because SP has no CU before then)
    apbz0_start = datetime.fromisoformat(str(apbzs_ap[0].valid_from)).astimezone(
        tz=None
    )
    assert apbz0_start.month == 7
    assert apbz0_start.day == 1

    # - the first APBZ ends at August (SP is blind in August, so it's cut)
    apbz0_end = datetime.fromisoformat(str(apbzs_ap[0].valid_to)).astimezone(tz=None)
    assert apbz0_end.month == 8
    assert apbz0_end.day == 1

    # - the second APBZ starts at September (CU resumes)
    apbz1_start = datetime.fromisoformat(str(apbzs_ap[1].valid_from)).astimezone(
        tz=None
    )
    assert apbz1_start.month == 9
    assert apbz1_start.day == 1

    # - the end date of the second APBZ is not shown (open-ended, too far in the future)
    assert apbzs_ap[1].valid_to is None


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "TP"]

    for role in roles_without_rla:
        apbz = list_accounting_point_bidding_zone.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(apbz, list)
        assert len(apbz) == 0
