from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    SystemOperatorProductTypeStatus,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeUpdateRequest,
    SystemOperatorProductTypeResponse,
    SystemOperatorProductTypeHistoryResponse,
    ErrorMessage,
)
from flex.api.product_type import (
    list_product_type,
)
from flex.api.system_operator_product_type import (
    list_system_operator_product_type,
    list_system_operator_product_type_history,
    read_system_operator_product_type,
    read_system_operator_product_type_history,
    create_system_operator_product_type,
    update_system_operator_product_type,
)
import pytest
from typing import cast


@pytest.fixture
def sts():
    yield SecurityTokenService()


# ---- ---- ---- ---- ----


def test_sopt_common(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    all_sopt = list_system_operator_product_type.sync(client=client_fiso)
    assert isinstance(all_sopt, list)
    nb_total_sopt = len(all_sopt)

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # endpoint: GET /system_operator_product_type
        sopt_visible = list_system_operator_product_type.sync(
            client=client,
        )
        assert isinstance(sopt_visible, list)

        # RLS: SOPT-COM002
        # can read all SOPT
        assert len(sopt_visible) == nb_total_sopt

        # endpoint: GET /system_operator_product_type/{id}
        sopt = read_system_operator_product_type.sync(
            client=client,
            id=cast(int, sopt_visible[0].id),
        )
        assert isinstance(sopt, SystemOperatorProductTypeResponse)

        # RLS: SOPT-COM001
        # can read history on SOPT they can read
        # only checking a few entries is sufficient
        for sopt in sopt_visible[:5]:
            # endpoint: GET /system_operator_product_type_history
            hist = list_system_operator_product_type_history.sync(
                client=client,
                system_operator_product_type_id=f"eq.{sopt.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /system_operator_product_type_history/{id}
            hist_sopt = read_system_operator_product_type_history.sync(
                client=client,
                id=cast(int, hist[0].id),
            )
            assert isinstance(hist_sopt, SystemOperatorProductTypeHistoryResponse)


# RLS: SOPT-FISO001
# FISO can read, create and update
def test_sopt_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    pts = list_product_type.sync(client=client_fiso)
    assert isinstance(pts, list)

    sopts = list_system_operator_product_type.sync(client=client_fiso)
    assert isinstance(sopts, list)

    sopt = read_system_operator_product_type.sync(
        client=client_fiso,
        id=cast(int, sopts[0].id),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    so_id = sts.get_userinfo(
        sts.fresh_client(TestEntity.TEST, "SO"),
    )["party_id"]

    # endpoint: POST /system_operator_product_type
    sopt = create_system_operator_product_type.sync(
        client=client_fiso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=cast(int, pts[4].id),
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    # endpoint: PATCH /system_operator_product_type/{id}
    u = update_system_operator_product_type.sync(
        client=client_fiso,
        id=cast(int, sopt.id),
        body=SystemOperatorProductTypeUpdateRequest(
            status=SystemOperatorProductTypeStatus.INACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)


# RLS: SOPT-SO001
# SO can create and update when they are SO
def test_sopt_so(sts):
    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_other_so = sts.fresh_client(TestEntity.COMMON, "SO")
    other_so_id = sts.get_userinfo(client_other_so)["party_id"]

    pts = list_product_type.sync(client=client_so)
    assert isinstance(pts, list)

    # SO1 creates a SOPT with SO2 as SO: ko
    sopt = create_system_operator_product_type.sync(
        client=client_so,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=other_so_id,
            product_type_id=cast(int, pts[2].id),
        ),
    )
    assert isinstance(sopt, ErrorMessage)

    # SO1 creates a SOPT with SO1 as SO: ok
    sopt = create_system_operator_product_type.sync(
        client=client_so,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=cast(int, pts[2].id),
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    # SO2 updates the SOPT of SO1: ko
    u = update_system_operator_product_type.sync(
        client=client_other_so,
        id=cast(int, sopt.id),
        body=SystemOperatorProductTypeUpdateRequest(
            status=SystemOperatorProductTypeStatus.INACTIVE,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # SO1 updates their own SOPT: ok
    u = update_system_operator_product_type.sync(
        client=client_so,
        id=cast(int, sopt.id),
        body=SystemOperatorProductTypeUpdateRequest(
            status=SystemOperatorProductTypeStatus.INACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)
