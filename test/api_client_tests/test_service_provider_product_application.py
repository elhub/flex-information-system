from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ServiceProviderProductApplicationHistoryResponse,
    ServiceProviderProductApplicationResponse,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationStatus,
    ErrorMessage,
)
from flex.api.product_type import (
    list_product_type,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    list_service_provider_product_application,
    read_service_provider_product_application,
    update_service_provider_product_application,
    create_service_provider_product_application,
    list_service_provider_product_application_history,
    read_service_provider_product_application_history,
)
import pytest
from typing import cast


@pytest.fixture()
def sts():
    yield SecurityTokenService()


# ---- ---- ---- ---- ----


# RLS: SPPA-FISO001
# FISO can read and update
def test_sppa_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    pts = list_product_type.sync(client=client_fiso)
    assert isinstance(pts, list)

    # ask for some product types before creating SPPA for this SO
    for pt_id in [pt.id for pt in pts[:3]]:
        sopt = create_system_operator_product_type.sync(
            client=client_fiso,
            body=SystemOperatorProductTypeCreateRequest(
                system_operator_id=so_id,
                product_type_id=cast(int, pt_id),
            ),
        )
        assert isinstance(sopt, SystemOperatorProductTypeResponse)

    # create one SPPA so that we can read something
    # endpoint: POST /service_provider_product_application
    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[cast(int, pt.id) for pt in pts[:2]],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    # endpoint: GET /service_provider_product_application
    sppas = list_service_provider_product_application.sync(client=client_fiso)
    assert isinstance(sppas, list)
    assert len(sppas) > 0

    # endpoint: GET /service_provider_product_application/{id}
    sppa = read_service_provider_product_application.sync(
        client=client_fiso,
        id=cast(int, sppas[0].id),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    # endpoint: PATCH /service_provider_product_application/{id}
    u = update_service_provider_product_application.sync(
        client=client_fiso,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.IN_PROGRESS,
        ),
    )
    assert not isinstance(u, ErrorMessage)


# RLS: SPPA-SP001
# SP can read, create and update SPPA concerning themselves
def test_sppa_sp(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_other_so = sts.fresh_client(TestEntity.TEST, "SO")
    other_so_id = sts.get_userinfo(client_other_so)["party_id"]

    pts = list_product_type.sync(client=client_fiso)
    assert isinstance(pts, list)

    # qualify the SP for 1 and 2 for the other SO

    for pt_id in [pt.id for pt in pts[:2]]:
        sopt = create_system_operator_product_type.sync(
            client=client_fiso,
            body=SystemOperatorProductTypeCreateRequest(
                system_operator_id=other_so_id,
                product_type_id=cast(int, pt_id),
            ),
        )
        assert isinstance(sopt, SystemOperatorProductTypeResponse)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=other_so_id,
            product_type_ids=[cast(int, pts[0].id)],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    # RLS: SPPA-SP002
    # still requested, update OK
    u = update_service_provider_product_application.sync(
        client=client_sp,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            product_type_ids=[cast(int, pt.id) for pt in pts[:2]],
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # qualify the SP with other SO (+ test timestamp requirements)

    u = update_service_provider_product_application.sync(
        client=client_other_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            qualified_at="2024-01-01T00:00:00Z",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPPA-VAL003
    # not qualified but keeping timestamp: not ok
    u = update_service_provider_product_application.sync(
        client=client_other_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.NOT_QUALIFIED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_provider_product_application.sync(
        client=client_other_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.NOT_QUALIFIED,
            qualified_at=None,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPPA-VAL002
    # qualified but no timestamp: not ok
    u = update_service_provider_product_application.sync(
        client=client_other_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_provider_product_application.sync(
        client=client_other_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2024-01-01T00:00:00Z",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # --------------------------------------------------------------------------

    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    # SO is linked to no product type so it is impossible to apply for anything
    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[cast(int, pt.id) for pt in pts[:2]],
        ),
    )
    assert isinstance(sppa, ErrorMessage)

    # fix it by linking product types to the SO
    for pt_id in [cast(int, pt.id) for pt in pts[:5]]:
        sopt = create_system_operator_product_type.sync(
            client=client_fiso,
            body=SystemOperatorProductTypeCreateRequest(
                system_operator_id=so_id,
                product_type_id=pt_id,
            ),
        )
        assert isinstance(sopt, SystemOperatorProductTypeResponse)

    # not allowed to create for another SP
    client_other_sp = sts.fresh_client(TestEntity.COMMON, "SP")
    sppa = create_service_provider_product_application.sync(
        client=client_other_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[cast(int, pt.id) for pt in pts[:2]],
        ),
    )
    assert isinstance(sppa, ErrorMessage)

    # but OK for themselves
    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[cast(int, pt.id) for pt in pts[:2]],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    # simple read test
    sppas = list_service_provider_product_application.sync(client=client_sp)
    assert isinstance(sppas, list)
    assert len(sppas) > 0

    # SO qualifies the SPPA
    u = update_service_provider_product_application.sync(
        client=client_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2024-01-01T00:00:00Z",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # product types / status tests
    # FISO does the updates because SP is not allowed to if the application is
    # not in the requested status

    # i.e. this fails
    u = update_service_provider_product_application.sync(
        client=client_sp,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            product_type_ids=[cast(int, pts[0].id)],
        ),
    )
    assert isinstance(u, ErrorMessage)


def test_sppa_so(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    pts = list_product_type.sync(client=client_fiso)
    assert isinstance(pts, list)

    all_sppas = list_service_provider_product_application.sync(
        client=client_fiso,
    )
    assert isinstance(all_sppas, list)

    sppas = list_service_provider_product_application.sync(
        client=client_so,
    )
    assert isinstance(sppas, list)

    # RLS: SPPA-SO001
    # read all SPPA
    assert len(sppas) == len(all_sppas)

    # RLS: SPPA-SO002
    # update SPPA targeting them

    sopt = create_system_operator_product_type.sync(
        client=client_fiso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=cast(int, pts[0].id),
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[cast(int, pts[0].id)],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.IN_PROGRESS
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # but not the others
    sppa = next(filter(lambda sppa: sppa.system_operator_id != so_id, sppas))

    u = update_service_provider_product_application.sync(
        client=client_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.IN_PROGRESS
        ),
    )
    assert isinstance(u, ErrorMessage)


def test_sppa_common(sts):
    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        sppa_visible = list_service_provider_product_application.sync(
            client=client,
        )
        assert isinstance(sppa_visible, list)

        # RLS: SPPA-COM001
        # can read history on SPPA they can read
        # only checking a few entries is sufficient
        for sppa in sppa_visible[:5]:
            # endpoint: GET /service_provider_product_application_history
            hist = list_service_provider_product_application_history.sync(
                client=client,
                service_provider_product_application_id=f"eq.{sppa.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /service_provider_product_application_history/{id}
            hist_sppa = read_service_provider_product_application_history.sync(
                client=client,
                id=cast(int, hist[0].id),
            )
            assert isinstance(
                hist_sppa,
                ServiceProviderProductApplicationHistoryResponse,
            )
