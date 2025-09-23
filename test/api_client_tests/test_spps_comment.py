from security_token_service import (
    SecurityTokenService,
    AuthenticatedClient,
    TestEntity,
)
from flex.models import (
    SystemOperatorProductTypeCreateRequest,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplicationResponse,
    ServiceProviderProductSuspensionReason,
    ServiceProviderProductSuspensionResponse,
    ServiceProviderProductSuspensionCreateRequest,
    ServiceProviderProductSuspensionCommentHistoryResponse,
    ServiceProviderProductSuspensionCommentResponse,
    ServiceProviderProductSuspensionCommentUpdateRequest,
    ServiceProviderProductSuspensionCommentCreateRequest,
    ServiceProviderProductSuspensionCommentVisibility,
    ErrorMessage,
    EmptyObject,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)
from flex.api.service_provider_product_suspension import (
    create_service_provider_product_suspension,
    delete_service_provider_product_suspension,
)
from flex.api.service_provider_product_suspension_comment import (
    list_service_provider_product_suspension_comment,
    read_service_provider_product_suspension_comment,
    update_service_provider_product_suspension_comment,
    create_service_provider_product_suspension_comment,
    list_service_provider_product_suspension_comment_history,
    read_service_provider_product_suspension_comment_history,
)
import pytest
from typing import cast


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(
        AuthenticatedClient,
        sts.get_client(TestEntity.TEST, "FISO"),
    )

    # setup : create a SPPA and suspend it

    # get fresh SO and ask for a product type
    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    sopt = create_system_operator_product_type.sync(
        client=client_fiso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=2,
        ),
    )
    assert not isinstance(sopt, ErrorMessage)

    # get fresh SP and create a SPPA for this SO
    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[2],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    # SO approves the SPPA
    u = update_service_provider_product_application.sync(
        client=client_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2025-08-08 Europe/Oslo",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SO suspends the SP
    spps = create_service_provider_product_suspension.sync(
        client=client_so,
        body=ServiceProviderProductSuspensionCreateRequest(
            service_provider_id=sp_id,
            product_type_ids=[2],
            reason=ServiceProviderProductSuspensionReason.CLEARING_ISSUES,
        ),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    yield (sts, client_so, client_sp, spps.id)


# ---- ---- ---- ---- ----


# RLS: SPPSC-FISO001
def test_sppsc_fiso(data):
    (sts, client_so, _, spps_id) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # both parties create a comment
    # (minimal visibility so the test is even more powerful)

    # endpoint: POST /service_provider_product_suspension_comment
    sppsc1 = create_service_provider_product_suspension_comment.sync(
        client=client_fiso,
        body=ServiceProviderProductSuspensionCommentCreateRequest(
            service_provider_product_suspension_id=spps_id,
            visibility=ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY,
            content="test1",
        ),
    )
    assert isinstance(sppsc1, ServiceProviderProductSuspensionCommentResponse)

    sppsc2 = create_service_provider_product_suspension_comment.sync(
        client=client_so,
        body=ServiceProviderProductSuspensionCommentCreateRequest(
            service_provider_product_suspension_id=spps_id,
            visibility=ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY,
            content="test2",
        ),
    )
    assert isinstance(sppsc2, ServiceProviderProductSuspensionCommentResponse)

    # FISO can read and update both
    # endpoint: GET /service_provider_product_suspension_comment
    sppscs = list_service_provider_product_suspension_comment.sync(
        client=client_fiso,
    )
    assert isinstance(sppscs, list)
    assert len(sppscs) > 0

    # endpoint: GET /service_provider_product_suspension_comment/{id}
    sppsc1 = read_service_provider_product_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, sppsc1.id),
    )
    assert isinstance(sppsc1, ServiceProviderProductSuspensionCommentResponse)

    # endpoint: PATCH /service_provider_product_suspension_comment/{id}
    u = update_service_provider_product_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, sppsc1.id),
        body=ServiceProviderProductSuspensionCommentUpdateRequest(
            content="test1 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_provider_product_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, sppsc2.id),
        body=ServiceProviderProductSuspensionCommentUpdateRequest(
            content="test2 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # ensure that deleting the suspension also deletes the comments
    d = delete_service_provider_product_suspension.sync(
        client=client_fiso,
        id=spps_id,
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    comments = list_service_provider_product_suspension_comment.sync(
        client=client_fiso,
        service_provider_product_suspension_id=f"eq.{spps_id}",
    )
    assert isinstance(comments, list)
    assert len(comments) == 0


# RLS: SPPSC-SO002
# RLS: SPPSC-SP002
def test_sppsc_so_sp(data):
    (sts, client_so, client_sp, spps_id) = data

    # RLS: SPPSC-COM002
    #   is also tested here because parties update their comments (visibility)

    # RLS: SPPSC-SO001
    # RLS: SPPSC-SP001
    #   are also tested here because both SO and SP create comments

    # need a second SO for testing visibilities
    client_so2 = sts.get_client(TestEntity.COMMON, "SO")

    # SO and SP both create an open comment

    sppsc_so = create_service_provider_product_suspension_comment.sync(
        client=client_so,
        body=ServiceProviderProductSuspensionCommentCreateRequest(
            service_provider_product_suspension_id=spps_id,
            visibility=ServiceProviderProductSuspensionCommentVisibility.ANY_PARTY,
            content="Comment SO",
        ),
    )
    assert isinstance(sppsc_so, ServiceProviderProductSuspensionCommentResponse)

    sppsc_sp = create_service_provider_product_suspension_comment.sync(
        client=client_sp,
        body=ServiceProviderProductSuspensionCommentCreateRequest(
            service_provider_product_suspension_id=spps_id,
            visibility=ServiceProviderProductSuspensionCommentVisibility.ANY_PARTY,
            content="Comment SP",
        ),
    )
    assert isinstance(sppsc_sp, ServiceProviderProductSuspensionCommentResponse)

    # both can read each other's comments

    sppsc_so_as_sp = read_service_provider_product_suspension_comment.sync(
        client=client_sp,
        id=cast(int, sppsc_so.id),
    )
    assert isinstance(sppsc_so_as_sp, ServiceProviderProductSuspensionCommentResponse)

    sppsc_sp_as_so = read_service_provider_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, sppsc_sp.id),
    )
    assert isinstance(sppsc_sp_as_so, ServiceProviderProductSuspensionCommentResponse)

    # SO's comment becomes open to system operators only

    u = update_service_provider_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, sppsc_so.id),
        body=ServiceProviderProductSuspensionCommentUpdateRequest(
            visibility=ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY_TYPE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # the second SO should be able to read it but not the SP

    sppsc_so_as_so2 = read_service_provider_product_suspension_comment.sync(
        client=client_so2,
        id=cast(int, sppsc_so.id),
    )
    assert isinstance(sppsc_so_as_so2, ServiceProviderProductSuspensionCommentResponse)

    sppsc_so_as_sp = read_service_provider_product_suspension_comment.sync(
        client=client_sp,
        id=cast(int, sppsc_so.id),
    )
    assert isinstance(sppsc_so_as_sp, ErrorMessage)

    # SO's comment becomes open to this SO only

    u = update_service_provider_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, sppsc_so.id),
        body=ServiceProviderProductSuspensionCommentUpdateRequest(
            visibility=ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # neither the second SO nor the SP should be able to read it

    sppsc_so_as_so2 = read_service_provider_product_suspension_comment.sync(
        client=client_so2,
        id=cast(int, sppsc_so.id),
    )
    assert isinstance(sppsc_so_as_so2, ErrorMessage)

    sppsc_so_as_sp = read_service_provider_product_suspension_comment.sync(
        client=client_sp,
        id=cast(int, sppsc_so.id),
    )
    assert isinstance(sppsc_so_as_sp, ErrorMessage)


def test_sppsc_common(data):
    (sts, _, _, _) = data

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        sppsc_visible = list_service_provider_product_suspension_comment.sync(
            client=client,
        )
        assert isinstance(sppsc_visible, list)

        # RLS: SPPSC-COM001
        # can read history on SPPSC they can read
        # only checking a few entries is sufficient
        for sppsc in sppsc_visible[:5]:
            # endpoint: GET /service_provider_product_suspension_comment_history
            hist = list_service_provider_product_suspension_comment_history.sync(
                client=client,
                service_provider_product_suspension_comment_id=f"eq.{sppsc.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /service_provider_product_suspension_comment_history/{id}
            hist_sppsc = read_service_provider_product_suspension_comment_history.sync(
                client=client,
                id=cast(int, hist[0].id),
            )
            assert isinstance(
                hist_sppsc,
                ServiceProviderProductSuspensionCommentHistoryResponse,
            )
