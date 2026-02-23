from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitResponse,
    ControllableUnitCreateRequest,
    ControllableUnitUpdateRequest,
    ControllableUnitHistoryResponse,
    ControllableUnitServiceProviderResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitStatus,
    ControllableUnitGridValidationStatus,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
    ErrorMessage,
    EmptyObject,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
    read_controllable_unit,
    update_controllable_unit,
    list_controllable_unit,
    list_controllable_unit_history,
    read_controllable_unit_history,
)
from flex.api.technical_resource import (
    create_technical_resource,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
    delete_controllable_unit_service_provider,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.service_providing_group_grid_prequalification import (
    create_service_providing_group_grid_prequalification,
)
from typing import cast
import datetime
import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: CU-FISO001
def test_controllable_unit_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    # create a CU and check the list of visible CUs is one CU longer

    # endpoint: GET /controllable_unit
    cus = list_controllable_unit.sync(
        client=client_fiso,
        limit="10000",
    )
    assert isinstance(cus, list)
    n_cus = len(cus)

    # endpoint: POST /controllable_unit
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-1",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cus = list_controllable_unit.sync(
        client=client_fiso,
        limit="10000",
    )
    assert isinstance(cus, list)
    n_cus2 = len(cus)
    assert n_cus2 == n_cus + 1

    # endpoint: GET /controllable_unit/{id}
    cu = read_controllable_unit.sync(client=client_fiso, id=cast(int, cu.id))
    assert isinstance(cu, ControllableUnitResponse)

    # update the CU and check the history is one record longer

    # RLS: CU-FISO002
    # endpoint: GET /controllable_unit_history
    hist = list_controllable_unit_history.sync(
        client=client_fiso,
        controllable_unit_id=f"eq.{cu.id}",
    )
    assert isinstance(hist, list)
    hist_size = len(hist)

    # endpoint: PATCH /controllable_unit/{id}
    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            name="TEST-CU-1-EDITED",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    hist = list_controllable_unit_history.sync(
        client=client_fiso,
        controllable_unit_id=f"eq.{cu.id}",
    )
    assert isinstance(hist, list)
    assert len(hist) == hist_size + 1

    # endpoint: GET /controllable_unit_history/{id}
    h = read_controllable_unit_history.sync(
        client=client_fiso,
        id=cast(int, hist[0].id),
    )
    assert isinstance(h, ControllableUnitHistoryResponse)

    # check status can be updated and un-terminated
    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.TERMINATED,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # RLS: CU-VAL004
    # status active impossible if no technical resource

    e = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.ACTIVE,
        ),
    )
    assert isinstance(e, ErrorMessage)

    tr = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="TEST-TR-FOR-ACTIVATION",
            controllable_unit_id=cast(int, cu.id),
        ),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.ACTIVE,
            validated_at=None,  # resetting for next test below
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # RLS: CU-VAL002
    # check validation time is required when status is validated
    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            grid_validation_status=ControllableUnitGridValidationStatus.VALIDATED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            grid_validation_status=ControllableUnitGridValidationStatus.VALIDATED,
            validated_at=datetime.datetime.fromisoformat("2024-01-01T08:00:00"),
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: CU-VAL003
    # validation failed requires timestamp reset
    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            grid_validation_status=ControllableUnitGridValidationStatus.VALIDATION_FAILED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            grid_validation_status=ControllableUnitGridValidationStatus.VALIDATION_FAILED,
            validated_at=None,
        ),
    )
    assert not isinstance(u, ErrorMessage)


def test_controllable_unit_so(sts):
    client_so = sts.get_client(TestEntity.TEST, "SO")
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    all_cus = list_controllable_unit.sync(client=client_fiso, limit="10000")
    assert isinstance(all_cus, list)

    client_iso = sts.get_client(TestEntity.COMMON, "SO")

    # RLS: CU-SO001
    # all test CUs on APs in 1000-2000 are within one MGA belonging to Test SO,
    # so the test SO should see them all
    n_cus_so = len(
        [
            cu
            for cu in all_cus
            if cast(int, cu.accounting_point_id) > 1000
            and cast(int, cu.accounting_point_id) < 2000
        ]
    )

    cus = list_controllable_unit.sync(client=client_so, limit="10000")
    assert isinstance(cus, list)

    # greater or equal here, because it is possible that the SO can read more
    # CUs due to SPG grid prequalification targeting them, opening visibility of
    # what is in the SPG
    assert len(cus) >= n_cus_so

    # check SO can update the last validation of a CU
    cu = cus[0]
    u = update_controllable_unit.sync(
        client=client_so,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            validated_at=datetime.datetime.fromisoformat("2024-01-01T08:00:00"),
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # but the other SO cannot
    u = update_controllable_unit.sync(
        client=client_iso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            validated_at=datetime.datetime.fromisoformat("2024-04-04T08:00:00"),
        ),
    )
    assert isinstance(u, ErrorMessage)

    # RLS: CU-SO002

    # NB: use common SO in this test
    # so that the accounting point RLS does not apply
    iso_id = sts.get_userinfo(client_iso)["party_id"]
    cus_iso = list_controllable_unit.sync(client=client_iso, limit="10000")
    assert isinstance(cus_iso, list)

    # create CU and SPG, link CU to SP in charge of the SPG,
    # add CU to SPG, mark SO as impacted for SPG

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-18",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.UP,
            maximum_active_power=2,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]
    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="New group",
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    client_eu = sts.get_client(TestEntity.TEST, "EU")
    eu_id = sts.get_userinfo(client_eu)["party_id"]
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=cast(int, spg.id),
            impacted_system_operator_id=iso_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    # check ISO can read the CU
    cus_iso2 = list_controllable_unit.sync(client=client_iso, limit="10000")
    assert isinstance(cus_iso2, list)
    assert len(cus_iso2) == len(cus_iso) + 1

    cu = read_controllable_unit.sync(client=client_iso, id=cast(int, cu.id))
    assert isinstance(cu, ControllableUnitResponse)

    # RLS: CU-SO003
    # NB: here checking on a few rows is sufficient
    for cu in cus_iso2[:5]:
        hist_iso = list_controllable_unit_history.sync(
            client=client_iso,
            controllable_unit_id=f"eq.{cu.id}",
        )
        assert isinstance(hist_iso, list)
        assert len(hist_iso) > 0


# RLS: CU-EU001
# RLS: CU-EU002
def test_controllable_unit_eu(sts):
    # former AP end user can see the old version of the CUs in the test data,
    # but not the current record

    client_former_eu = sts.get_client(TestEntity.COMMON, "EU")

    cuhs_former_eu = list_controllable_unit_history.sync(
        client=client_former_eu,
        limit="10000",
    )
    assert isinstance(cuhs_former_eu, list)

    assert len(cuhs_former_eu) > 0

    old_cuhs = list(
        filter(
            lambda cuh: "COMMON-EU-ES-2023" in cast(str, cuh.name),
            cuhs_former_eu,
        )
    )
    assert len(old_cuhs) > 0

    cu = read_controllable_unit.sync(
        client=client_former_eu,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ControllableUnitResponse)
    # the latest they can see is the one last introduced before the EU changed
    assert "TEST-SP-2024-07" in cast(str, cu.name)

    # current AP end user can see the current version of the CU,
    # but not the old records

    client_eu = sts.get_client(TestEntity.TEST, "EU")

    cu = read_controllable_unit.sync(
        client=client_eu,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cuhs_eu = list_controllable_unit_history.sync(
        client=client_eu,
        limit="10000",
    )
    assert isinstance(cuhs_eu, list)

    old_cuhs = list(
        filter(
            lambda cuh: "COMMON-EU-ES-2023" in cast(str, cuh.name),
            cuhs_eu,
        )
    )
    assert len(old_cuhs) == 0


# RLS: CU-ES001
# RLS: CU-ES002
def test_controllable_unit_es(sts):
    # former AP energy supplier can see the old version of the CUs in the test
    # data, but not the current record

    client_former_es = sts.get_client(TestEntity.COMMON, "ES")

    cuhs_former_es = list_controllable_unit_history.sync(
        client=client_former_es,
        limit="10000",
    )
    assert isinstance(cuhs_former_es, list)

    assert len(cuhs_former_es) > 0

    old_cuhs = list(
        filter(
            lambda cuh: "COMMON-EU-ES-2023" in cast(str, cuh.name),
            cuhs_former_es,
        )
    )
    assert len(old_cuhs) > 0

    cu = read_controllable_unit.sync(
        client=client_former_es,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ControllableUnitResponse)
    assert "TEST-SP-2024-07" in cast(str, cu.name)

    # current AP energy supplier can see the current version of the CU,
    # but not the old records

    client_es = sts.get_client(TestEntity.TEST, "ES")

    cu = read_controllable_unit.sync(
        client=client_es,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cuhs_es = list_controllable_unit_history.sync(
        client=client_es,
        limit="10000",
    )
    assert isinstance(cuhs_es, list)

    old_cuhs = list(
        filter(
            lambda cuh: "COMMON-EU-ES-2023" in cast(str, cuh.name),
            cuhs_es,
        )
    )
    assert len(old_cuhs) == 0


# RLS: CU-BRP001
# RLS: CU-BRP002
def test_controllable_unit_brp(sts):
    # former AP BRP can see the old version of the CUs in the test data,
    # but not the current record

    client_former_brp = sts.get_client(TestEntity.COMMON, "BRP")

    cus_former_brp = list_controllable_unit.sync(client=client_former_brp)
    assert isinstance(cus_former_brp, list)

    # filtering on one test user
    cus_former_brp = [
        cu
        for cu in cus_former_brp
        if cast(int, cu.accounting_point_id) > 1000
        and cast(int, cu.accounting_point_id) < 2000
    ]
    assert len(cus_former_brp) == 3
    cu_ids = {cast(int, cu.id) for cu in cus_former_brp}

    cuhs_former_brp = list_controllable_unit_history.sync(
        client=client_former_brp,
    )
    assert isinstance(cuhs_former_brp, list)
    # filtering on one test user
    cuhs_former_brp = [
        cuh for cuh in cuhs_former_brp if cast(int, cuh.controllable_unit_id) in cu_ids
    ]

    # they see the record designed for this test (COMMON-BRP-CUSP-2024) but as
    # they are BRP a bit longer before and after this test record, they can also
    # see the one before and the one after
    assert len(cuhs_former_brp) == 9
    assert any("COMMON-BRP-CUSP-2024" in cast(str, cuh.name) for cuh in cuhs_former_brp)

    # CU names are the ones of the last record they can see
    assert all("COMMON-SP-AS-OF-2024" in cast(str, cu.name) for cu in cus_former_brp)

    # current AP BRP can see the current version of the CU,
    # but not the old records

    client_brp = sts.get_client(TestEntity.TEST, "BRP")

    cu = read_controllable_unit.sync(
        client=client_brp,
        id=cast(int, cus_former_brp[0].id),
    )
    assert isinstance(cu, ControllableUnitResponse)
    assert "2024" not in cast(str, cu.name)

    cuhs = list_controllable_unit_history.sync(
        client=client_brp,
        limit="10000",
    )
    assert isinstance(cuhs, list)

    assert all("COMMON-BRP-CUSP-2024" not in cast(str, cuh.name) for cuh in cuhs)


def test_controllable_unit_sp(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp1 = sts.get_client(TestEntity.TEST, "SP")
    sp1_id = sts.get_userinfo(client_sp1)["party_id"]

    client_sp2 = sts.get_client(TestEntity.COMMON, "SP")
    sp2_id = sts.get_userinfo(client_sp2)["party_id"]

    client_eu = sts.get_client(TestEntity.TEST, "EU")
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-2",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
            grid_node_id="92a7d3bf-fee5-4abc-9130-75c8067ea78c",
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    # RLS: CU-SP001
    # check that a fresh CU is invisible for an SP it is not linked to
    r = read_controllable_unit.sync(client=client_sp1, id=cast(int, cu.id))
    assert isinstance(r, ErrorMessage)

    # create CU-SP in the distant future
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp1_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2099-01-01T00:00:00+01:00"),
            valid_to=None,
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    # now the CU-SP is there, the SP can read the CU
    r = read_controllable_unit.sync(client=client_sp1, id=cast(int, cu.id))
    assert isinstance(r, ControllableUnitResponse)

    # but not true for another SP
    r = read_controllable_unit.sync(client=client_sp2, id=cast(int, cu.id))
    assert isinstance(r, ErrorMessage)

    delete_controllable_unit_service_provider.sync(
        client=client_fiso,
        id=cast(int, cu_sp.id),
        body=EmptyObject(),
    )

    # RLS: CU-SP002
    cu = create_controllable_unit.sync(
        client=client_sp1,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-2",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    # RLS: CU-SP005
    # SP1 can read the CU they just created
    r = read_controllable_unit.sync(client=client_sp1, id=cast(int, cu.id))
    assert isinstance(r, ControllableUnitResponse)

    # RLS: CU-SP003
    # create CU-SP in the distant future
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp1_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2099-01-01T00:00:00+01:00"),
            valid_to=None,
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    # create CU-SP now for the second SP
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp2_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
            valid_to=datetime.datetime.fromisoformat("2090-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    # SP1 should not be able to edit because its contract is in the future
    u = update_controllable_unit.sync(
        client=client_sp1,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            name="TEST-CU-2-EDITED",
        ),
    )
    assert isinstance(u, ErrorMessage)

    # but SP2 should now be able to edit
    u = update_controllable_unit.sync(
        client=client_sp2,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            name="TEST-CU-2-EDITED",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # check status can be updated but not reset to new or un-terminated

    # just need a TR for that
    tr = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="TEST-TR-FOR-ACTIVATION",
            controllable_unit_id=cast(int, cu.id),
        ),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    u = update_controllable_unit.sync(
        client=client_sp2,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    u = update_controllable_unit.sync(
        client=client_sp2,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.NEW,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_controllable_unit.sync(
        client=client_sp2,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.TERMINATED,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    u = update_controllable_unit.sync(
        client=client_sp2,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.ACTIVE,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # RLS: CU-SP004
    cus_sp1 = list_controllable_unit.sync(client=client_sp1)
    assert isinstance(cus_sp1, list)
    assert len(cus_sp1) > 0

    # NB: here checking on a few rows is sufficient
    for cu_sp1 in cus_sp1[:5]:
        hist_sp1 = list_controllable_unit_history.sync(
            client=client_sp1,
            controllable_unit_id=f"eq.{cu_sp1.id}",
        )
        assert isinstance(hist_sp1, list)
        assert len(hist_sp1) > 0

    # verify that CU status is changed to "pending" when a CU is updated by SP
    # must first set it to a state where it will be changed
    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            grid_validation_status=ControllableUnitGridValidationStatus.VALIDATION_FAILED,
        ),
    )
    assert not (isinstance(u, ErrorMessage))
    assert isinstance(u, ControllableUnitResponse)
    assert (
        u.grid_validation_status
        == ControllableUnitGridValidationStatus.VALIDATION_FAILED
    )

    u = update_controllable_unit.sync(
        client=client_sp2,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(maximum_active_power=500),
    )
    assert isinstance(u, ControllableUnitResponse)
    assert u.grid_validation_status == ControllableUnitGridValidationStatus.PENDING


def test_rla_absence(sts):
    roles_without_rla = ["TP"]

    for role in roles_without_rla:
        cus = list_controllable_unit.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(cus, list)
        assert len(cus) == 0
