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

    # create another, completely unrelated SPPS to check comments are
    # unreachable there

    client_so2 = sts.fresh_client(TestEntity.TEST, "SO")
    so2_id = sts.get_userinfo(client_so2)["party_id"]

    sopt = create_system_operator_product_type.sync(
        client=client_fiso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so2_id,
            product_type_id=6,
        ),
    )
    assert not isinstance(sopt, ErrorMessage)

    client_sp2 = sts.fresh_client(TestEntity.TEST, "SP")
    sp2_id = sts.get_userinfo(client_sp2)["party_id"]

    sppa = create_service_provider_product_application.sync(
        client=client_sp2,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp2_id,
            system_operator_id=so2_id,
            product_type_ids=[6],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_so2,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2025-08-08 Europe/Oslo",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    spps2 = create_service_provider_product_suspension.sync(
        client=client_so2,
        body=ServiceProviderProductSuspensionCreateRequest(
            service_provider_id=sp2_id,
            product_type_ids=[6],
            reason=ServiceProviderProductSuspensionReason.FAILED_VERIFICATION,
        ),
    )
    assert isinstance(spps2, ServiceProviderProductSuspensionResponse)

    yield (sts, client_so, client_sp, spps.id, spps2.id)


# ---- ---- ---- ---- ----


def check_history(clt, sppsc_id):
    # endpoint: GET /service_provider_product_suspension_comment_history
    h = list_service_provider_product_suspension_comment_history.sync(
        client=clt,
        service_provider_product_suspension_comment_id=f"eq.{sppsc_id}",
    )
    if not isinstance(h, list) or len(h) == 0:
        return False

    # endpoint: GET /service_provider_product_suspension_comment_history/{id}
    h1 = read_service_provider_product_suspension_comment_history.sync(
        client=clt,
        id=cast(int, h[0].id),
    )
    return isinstance(
        h1,
        ServiceProviderProductSuspensionCommentHistoryResponse,
    )


# RLS: SPPSC-FISO001
def test_sppsc_fiso(data):
    (sts, client_so, _, spps_id, _) = data

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

    # RLS: SPPSC-FISO002
    check_history(client_fiso, sppsc1.id)

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
    (sts, client_so, client_sp, spps_id, unrelated_spps_id) = data

    # RLS: SPPSC-COM001
    #   is also tested here because parties update their comments (visibility)

    # RLS: SPPSC-SO001
    # RLS: SPPSC-SP001
    #   are also tested here because both SO and SP create comments

    # SO and SP both create an open comment

    sppsc_so = create_service_provider_product_suspension_comment.sync(
        client=client_so,
        body=ServiceProviderProductSuspensionCommentCreateRequest(
            service_provider_product_suspension_id=spps_id,
            visibility=ServiceProviderProductSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SO",
        ),
    )
    assert isinstance(sppsc_so, ServiceProviderProductSuspensionCommentResponse)

    sppsc_sp = create_service_provider_product_suspension_comment.sync(
        client=client_sp,
        body=ServiceProviderProductSuspensionCommentCreateRequest(
            service_provider_product_suspension_id=spps_id,
            visibility=ServiceProviderProductSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
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

    # SO's comment becomes open to this SO only

    u = update_service_provider_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, sppsc_so.id),
        body=ServiceProviderProductSuspensionCommentUpdateRequest(
            visibility=ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SP should not be able to read it

    sppsc_so_as_sp = read_service_provider_product_suspension_comment.sync(
        client=client_sp,
        id=cast(int, sppsc_so.id),
    )
    assert isinstance(sppsc_so_as_sp, ErrorMessage)

    # check they cannot read anything from the unrelated SPPS

    usppscs_as_so = list_service_provider_product_suspension_comment.sync(
        client=client_so,
        service_provider_product_suspension_id=f"eq.{unrelated_spps_id}",
    )
    assert isinstance(usppscs_as_so, list)
    assert len(usppscs_as_so) == 0

    usppscs_as_sp = list_service_provider_product_suspension_comment.sync(
        client=client_sp,
        service_provider_product_suspension_id=f"eq.{unrelated_spps_id}",
    )
    assert isinstance(usppscs_as_sp, list)
    assert len(usppscs_as_sp) == 0

    # RLS: SPPSC-SO003
    # RLS: SPPSC-SP003

    # SO can read history on SP's comment because it is public
    assert check_history(client_so, sppsc_sp.id)
    # but SP cannot read history on SO's comment because it is now private
    assert not check_history(client_sp, sppsc_so.id)

    # SO makes comment public again
    u = update_service_provider_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, sppsc_so.id),
        body=ServiceProviderProductSuspensionCommentUpdateRequest(
            visibility=ServiceProviderProductSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # now SP can read history
    assert check_history(client_sp, sppsc_so.id)

    # delete the SPPS so that comments disappear
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    d = delete_service_provider_product_suspension.sync(
        client=client_fiso,
        id=spps_id,
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    # history is still reachable
    assert check_history(client_sp, sppsc_so.id)
    assert check_history(client_so, sppsc_sp.id)
