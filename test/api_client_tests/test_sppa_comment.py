from security_token_service import (
    SecurityTokenService,
    TestEntity,
    AuthenticatedClient,
)
from flex.models import (
    SystemOperatorProductTypeCreateRequest,
    ServiceProviderProductApplication,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationCommentHistory,
    ServiceProviderProductApplicationComment,
    ServiceProviderProductApplicationCommentUpdateRequest,
    ServiceProviderProductApplicationCommentCreateRequest,
    ServiceProviderProductApplicationCommentVisibility,
    ErrorMessage,
)
from flex.api.product_type import (
    list_product_type,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
)
from flex.api.service_provider_product_application_comment import (
    list_service_provider_product_application_comment,
    read_service_provider_product_application_comment,
    update_service_provider_product_application_comment,
    create_service_provider_product_application_comment,
    list_service_provider_product_application_comment_history,
    read_service_provider_product_application_comment_history,
)
import pytest
from typing import cast


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    pts = list_product_type.sync(client=client_fiso)
    assert isinstance(pts, list)

    # setup : create a SPPA

    # get fresh SO and ask for a product type
    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    sopt = create_system_operator_product_type.sync(
        client=client_fiso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=cast(int, pts[4].id),
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
            product_type_ids=[cast(int, pts[4].id)],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplication)

    yield (sts, client_so, client_sp, sppa.id)


# ---- ---- ---- ---- ----


def check_history(clt, sppsc_id):
    # endpoint: GET /service_provider_product_application_comment_history
    h = list_service_provider_product_application_comment_history.sync(
        client=clt,
        service_provider_product_application_comment_id=f"eq.{sppsc_id}",
    )
    if not isinstance(h, list) or len(h) == 0:
        return False

    # endpoint: GET /service_provider_product_application_comment_history/{id}
    h1 = read_service_provider_product_application_comment_history.sync(
        client=clt,
        id=cast(int, h[0].id),
    )
    return isinstance(
        h1,
        ServiceProviderProductApplicationCommentHistory,
    )


# RLS: SPPAC-FISO001
def test_sppac_fiso(data):
    (sts, client_so, _, sppa_id) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # both parties create a comment
    # (minimal visibility so the test is even more powerful)

    # endpoint: POST /service_provider_product_application_comment
    sppac1 = create_service_provider_product_application_comment.sync(
        client=client_fiso,
        body=ServiceProviderProductApplicationCommentCreateRequest(
            service_provider_product_application_id=sppa_id,
            visibility=ServiceProviderProductApplicationCommentVisibility.SAME_PARTY,
            content="test1",
        ),
    )
    assert isinstance(sppac1, ServiceProviderProductApplicationComment)

    sppac2 = create_service_provider_product_application_comment.sync(
        client=client_so,
        body=ServiceProviderProductApplicationCommentCreateRequest(
            service_provider_product_application_id=sppa_id,
            visibility=ServiceProviderProductApplicationCommentVisibility.SAME_PARTY,
            content="test2",
        ),
    )
    assert isinstance(sppac2, ServiceProviderProductApplicationComment)

    # FISO can read and update both
    # endpoint: GET /service_provider_product_application_comment
    sppacs = list_service_provider_product_application_comment.sync(
        client=client_fiso,
    )
    assert isinstance(sppacs, list)
    assert len(sppacs) > 0

    # endpoint: GET /service_provider_product_application_comment/{id}
    sppac1 = read_service_provider_product_application_comment.sync(
        client=client_fiso,
        id=cast(int, sppac1.id),
    )
    assert isinstance(sppac1, ServiceProviderProductApplicationComment)

    # endpoint: PATCH /service_provider_product_application_comment/{id}
    u = update_service_provider_product_application_comment.sync(
        client=client_fiso,
        id=cast(int, sppac1.id),
        body=ServiceProviderProductApplicationCommentUpdateRequest(
            content="test1 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_provider_product_application_comment.sync(
        client=client_fiso,
        id=cast(int, sppac2.id),
        body=ServiceProviderProductApplicationCommentUpdateRequest(
            content="test2 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPPAC-FISO002
    check_history(client_fiso, sppac1.id)


# RLS: SPPAC-SO002
# RLS: SPPAC-SP002
def test_sppac_so_sp(data):
    (sts, client_so, client_sp, sppa_id) = data

    # RLS: SPPAC-COM001
    #   is also tested here because parties update their comments (visibility)

    # RLS: SPPAC-SO001
    # RLS: SPPAC-SP001
    #   is also tested here because both SO and SP create comments

    # SO and SP both create an open comment

    sppac_so = create_service_provider_product_application_comment.sync(
        client=client_so,
        body=ServiceProviderProductApplicationCommentCreateRequest(
            service_provider_product_application_id=sppa_id,
            visibility=ServiceProviderProductApplicationCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SO",
        ),
    )
    assert isinstance(sppac_so, ServiceProviderProductApplicationComment)

    sppac_sp = create_service_provider_product_application_comment.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCommentCreateRequest(
            service_provider_product_application_id=sppa_id,
            visibility=ServiceProviderProductApplicationCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SP",
        ),
    )
    assert isinstance(sppac_sp, ServiceProviderProductApplicationComment)

    # both can read each other's comments

    sppac_so_as_sp = read_service_provider_product_application_comment.sync(
        client=client_sp,
        id=cast(int, sppac_so.id),
    )
    assert isinstance(sppac_so_as_sp, ServiceProviderProductApplicationComment)

    sppac_sp_as_so = read_service_provider_product_application_comment.sync(
        client=client_so,
        id=cast(int, sppac_sp.id),
    )
    assert isinstance(sppac_sp_as_so, ServiceProviderProductApplicationComment)

    # SO's comment becomes open to this SO only

    u = update_service_provider_product_application_comment.sync(
        client=client_so,
        id=cast(int, sppac_so.id),
        body=ServiceProviderProductApplicationCommentUpdateRequest(
            visibility=ServiceProviderProductApplicationCommentVisibility.SAME_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SP should not be able to read it

    sppac_so_as_sp = read_service_provider_product_application_comment.sync(
        client=client_sp,
        id=cast(int, sppac_so.id),
    )
    assert isinstance(sppac_so_as_sp, ErrorMessage)

    # RLS: SPPAC-SO003
    # RLS: SPPAC-SP003

    # SO can read history on SP's comment because it is public
    assert check_history(client_so, sppac_sp.id)
    # but SP cannot read history on SO's comment because it is now private
    assert not check_history(client_sp, sppac_so.id)

    # SO makes comment public again
    u = update_service_provider_product_application_comment.sync(
        client=client_so,
        id=cast(int, sppac_so.id),
        body=ServiceProviderProductApplicationCommentUpdateRequest(
            visibility=ServiceProviderProductApplicationCommentVisibility.ANY_INVOLVED_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # now SP can read history
    assert check_history(client_sp, sppac_so.id)


def test_sppa_common(data):
    (sts, _, _, _) = data

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        sppac_visible = list_service_provider_product_application_comment.sync(
            client=client,
        )
        assert isinstance(sppac_visible, list)

        # RLS: SPPAC-COM001
        # can read history on SPPAC they can read
        # only checking a few entries is sufficient
        for sppac in sppac_visible[:5]:
            # endpoint: GET /service_provider_product_application_comment_history
            hist = list_service_provider_product_application_comment_history.sync(
                client=client,
                service_provider_product_application_comment_id=f"eq.{sppac.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /service_provider_product_application_comment_history/{id}
            hist_sppac = read_service_provider_product_application_comment_history.sync(
                client=client,
                id=cast(int, hist[0].id),
            )
            assert isinstance(
                hist_sppac,
                ServiceProviderProductApplicationCommentHistory,
            )
