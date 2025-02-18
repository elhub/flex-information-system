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
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
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
import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: CU-FISO001
def test_controllable_unit_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    # create a CU and check the list of visible CUs is one CU longer

    # endpoint: GET /controllable_unit
    cus = list_controllable_unit.sync(client=client_fiso)
    assert isinstance(cus, list)
    n_cus = len(cus)

    # endpoint: POST /controllable_unit
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-1",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cus = list_controllable_unit.sync(client=client_fiso)
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

    u = update_controllable_unit.sync(
        client=client_fiso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            status=ControllableUnitStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))


def test_controllable_unit_so(sts):
    client_so = sts.get_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    cus_where_cso = list_controllable_unit.sync(
        client=client_fiso, connecting_system_operator_id=f"eq.{so_id}"
    )
    assert isinstance(cus_where_cso, list)
    all_cus = list_controllable_unit.sync(client=client_fiso)
    assert isinstance(all_cus, list)

    client_iso = sts.get_client(TestEntity.COMMON, "SO")

    # RLS: CU-SO001
    # check SO can see some CUs but not all of them
    cus = list_controllable_unit.sync(client=client_so)
    assert isinstance(cus, list)
    assert len(cus) >= len(cus_where_cso) and len(cus) <= len(all_cus)

    # check SO can update the last validation of a CU
    cu = cus_where_cso[0]
    u = update_controllable_unit.sync(
        client=client_so,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            last_validated="2024-01-01T08:00:00",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # but the other SO cannot
    u = update_controllable_unit.sync(
        client=client_iso,
        id=cast(int, cu.id),
        body=ControllableUnitUpdateRequest(
            last_validated="2024-04-04T08:00:00",
        ),
    )
    assert isinstance(u, ErrorMessage)

    # RLS: CU-SO002

    # NB: use common SO in this test
    # so that the accounting point RLS does not apply
    iso_id = sts.get_userinfo(client_iso)["party_id"]
    cus_iso = list_controllable_unit.sync(client=client_iso)
    assert isinstance(cus_iso, list)

    # create CU and SPG, link CU to SP in charge of the SPG,
    # add CU to SPG, mark SO as impacted for SPG

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-18",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.UP,
            maximum_available_capacity=2,
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
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            contract_reference="TEST-CONTRACT",
            valid_from="2024-01-01T08:00:00+00:00",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T08:01:00+00:00",
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
    cus_iso2 = list_controllable_unit.sync(client=client_iso)
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

    cuhs_former_eu = list_controllable_unit_history.sync(client=client_former_eu)
    assert isinstance(cuhs_former_eu, list)

    assert len(cuhs_former_eu) > 0

    old_cuhs = list(
        filter(
            lambda cuh: "FORMER NAME" in cast(str, cuh.name),
            cuhs_former_eu,
        )
    )
    assert len(old_cuhs) > 0

    cu = read_controllable_unit.sync(
        client=client_former_eu,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ErrorMessage)

    # current AP end user can see the current version of the CU,
    # but not the old records

    client_eu = sts.get_client(TestEntity.TEST, "EU")

    cu = read_controllable_unit.sync(
        client=client_eu,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cuhs_eu = list_controllable_unit_history.sync(client=client_eu)
    assert isinstance(cuhs_eu, list)

    old_cuhs = list(
        filter(
            lambda cuh: "FORMER NAME" in cast(str, cuh.name),
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

    cuhs_former_es = list_controllable_unit_history.sync(client=client_former_es)
    assert isinstance(cuhs_former_es, list)

    assert len(cuhs_former_es) > 0

    old_cuhs = list(
        filter(
            lambda cuh: "FORMER NAME" in cast(str, cuh.name),
            cuhs_former_es,
        )
    )
    assert len(old_cuhs) > 0

    cu = read_controllable_unit.sync(
        client=client_former_es,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ErrorMessage)

    # current AP energy supplier can see the current version of the CU,
    # but not the old records

    client_es = sts.get_client(TestEntity.TEST, "ES")

    cu = read_controllable_unit.sync(
        client=client_es,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cuhs_eu = list_controllable_unit_history.sync(client=client_es)
    assert isinstance(cuhs_eu, list)

    old_cuhs = list(
        filter(
            lambda cuh: "FORMER NAME" in cast(str, cuh.name),
            cuhs_eu,
        )
    )
    assert len(old_cuhs) == 0


# RLS: CU-BRP001
# RLS: CU-BRP002
def test_controllable_unit_brp(sts):
    # former AP BRP can see the old version of the CUs in the test data,
    # but not the current record

    client_former_brp = sts.get_client(TestEntity.COMMON, "BRP")

    cuhs_former_brp = list_controllable_unit_history.sync(
        client=client_former_brp,
    )
    assert isinstance(cuhs_former_brp, list)

    assert len(cuhs_former_brp) > 0

    old_cuhs = list(
        filter(
            lambda cuh: "FORMER NAME" in cast(str, cuh.name),
            cuhs_former_brp,
        )
    )
    assert len(old_cuhs) > 0

    cu = read_controllable_unit.sync(
        client=client_former_brp,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ErrorMessage)

    # current AP BRP can see the current version of the CU,
    # but not the old records

    client_brp = sts.get_client(TestEntity.TEST, "BRP")

    cu = read_controllable_unit.sync(
        client=client_brp,
        id=cast(int, old_cuhs[0].controllable_unit_id),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cuhs_eu = list_controllable_unit_history.sync(client=client_brp)
    assert isinstance(cuhs_eu, list)

    old_cuhs = list(
        filter(
            lambda cuh: "FORMER NAME" in cast(str, cuh.name),
            cuhs_eu,
        )
    )
    assert len(old_cuhs) == 0


def test_controllable_unit_sp(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp1 = sts.get_client(TestEntity.TEST, "SP")
    sp1_id = sts.get_userinfo(client_sp1)["party_id"]

    client_sp2 = sts.get_client(TestEntity.COMMON, "SP")
    sp2_id = sts.get_userinfo(client_sp2)["party_id"]

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-2",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
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
            contract_reference="TEST-CONTRACT",
            valid_from="2099-01-01T10:00:00+00:00",
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
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    # RLS: CU-SP003
    # create CU-SP in the distant future
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp1_id,
            contract_reference="TEST-CONTRACT",
            valid_from="2099-01-01T10:00:00+00:00",
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
            contract_reference="TEST-CONTRACT",
            valid_from="2000-01-01T10:00:00+00:00",
            valid_to="2090-01-01T10:00:00+00:00",
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
    for cu in cus_sp1[:5]:
        hist_sp1 = list_controllable_unit_history.sync(
            client=client_sp1,
            controllable_unit_id=f"eq.{cu.id}",
        )
        assert isinstance(hist_sp1, list)
        assert len(hist_sp1) > 0


def test_rla_absence(sts):
    roles_without_rla = ["TP"]

    for role in roles_without_rla:
        cus = list_controllable_unit.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(cus, list)
        assert len(cus) == 0
