from typing import cast

import pytest
from flex.api.service_providing_group import create_service_providing_group
from flex.api.service_providing_group_grid_prequalification import (
    create_service_providing_group_grid_prequalification,
)
from flex.api.service_providing_group_grid_prequalification_comment import (
    list_service_providing_group_grid_prequalification_comment,
    read_service_providing_group_grid_prequalification_comment,
    update_service_providing_group_grid_prequalification_comment,
    create_service_providing_group_grid_prequalification_comment,
    list_service_providing_group_grid_prequalification_comment_history,
    read_service_providing_group_grid_prequalification_comment_history,
)
from flex.models.service_providing_group_create_request import (
    ServiceProvidingGroupCreateRequest,
)
from flex.models.service_providing_group import ServiceProvidingGroup
from flex.models.service_providing_group_bidding_zone import (
    ServiceProvidingGroupBiddingZone,
)
from flex.models.service_providing_group_grid_prequalification_create_request import (
    ServiceProvidingGroupGridPrequalificationCreateRequest,
)
from flex.models.service_providing_group_grid_prequalification import (
    ServiceProvidingGroupGridPrequalification,
)
from flex.models.service_providing_group_grid_prequalification_comment_create_request import (
    ServiceProvidingGroupGridPrequalificationCommentCreateRequest,
)
from flex.models.service_providing_group_grid_prequalification_comment import (
    ServiceProvidingGroupGridPrequalificationComment,
)
from flex.models.service_providing_group_grid_prequalification_comment_update_request import (
    ServiceProvidingGroupGridPrequalificationCommentUpdateRequest,
)
from flex.models.service_providing_group_grid_prequalification_comment_visibility import (
    ServiceProvidingGroupGridPrequalificationCommentVisibility,
)
from flex.models.service_providing_group_grid_prequalification_comment_history import (
    ServiceProvidingGroupGridPrequalificationCommentHistory,
)
from flex.models.error_message import ErrorMessage
from flex.client import AuthenticatedClient
from security_token_service import SecurityTokenService, TestEntity


def create_spggp(client_fiso, sp, so):
    (client_sp, sp_id) = sp
    (client_so, so_id) = so

    # chain of dependency to be able to create SPG product suspensions:
    #   see test for SPG product suspension

    spg = create_service_providing_group.sync(
        client=client_sp,
        body=ServiceProvidingGroupCreateRequest(
            name="Test SPG for SPGGP comment",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroup)

    spgps = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            impacted_system_operator_id=so_id,
            service_providing_group_id=spg.id,
        ),
    )

    # Need to set prequalified at and status in update  call
    assert isinstance(spgps, ServiceProvidingGroupGridPrequalification)

    return spgps.id


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    client_so = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # create a suspension

    spggp_id = create_spggp(client_fiso, (client_sp, sp_id), (client_so, so_id))

    # create a totally unrelated suspension

    client_common_so = cast(
        AuthenticatedClient, sts.get_client(TestEntity.COMMON, "SO")
    )
    common_so_id = sts.get_userinfo(client_common_so)["party_id"]

    client_other_sp = sts.fresh_client(TestEntity.COMMON, "SP")
    other_sp_id = sts.get_userinfo(client_other_sp)["party_id"]

    unrelated_spggp_id = create_spggp(
        client_fiso,
        (client_other_sp, other_sp_id),
        (client_common_so, common_so_id),
    )

    yield (sts, client_so, client_sp, spggp_id, unrelated_spggp_id)


# ---- ---- ---- ---- ----


def check_history(clt, spggpc_id):
    # endpoint: GET /service_providing_group_grid_prequalification_comment_history
    h = list_service_providing_group_grid_prequalification_comment_history.sync(
        client=clt,
        service_providing_group_grid_prequalification_comment_id=f"eq.{spggpc_id}",
    )
    if not isinstance(h, list) or len(h) == 0:
        return False

    # endpoint: GET /service_providing_group_grid_prequalification_comment_history/{id}
    h1 = read_service_providing_group_grid_prequalification_comment_history.sync(
        client=clt,
        id=cast(int, h[0].id),
    )
    return isinstance(
        h1,
        ServiceProvidingGroupGridPrequalificationCommentHistory,
    )


# RLS: SPGGPC-FISO001
def test_spggp_comment_fiso(data):
    (sts, client_so, _, spggp_id, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # both parties create a comment
    # (minimal visibility so the test is even more powerful)

    # endpoint: POST /service_providing_group_grid_prequalification_comment
    spggpc1 = create_service_providing_group_grid_prequalification_comment.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCommentCreateRequest(
            service_providing_group_grid_prequalification_id=spggp_id,
            visibility=ServiceProvidingGroupGridPrequalificationCommentVisibility.SAME_PARTY,
            content="test1",
        ),
    )
    assert isinstance(spggpc1, ServiceProvidingGroupGridPrequalificationComment)

    spggpc2 = create_service_providing_group_grid_prequalification_comment.sync(
        client=client_so,
        body=ServiceProvidingGroupGridPrequalificationCommentCreateRequest(
            service_providing_group_grid_prequalification_id=spggp_id,
            visibility=ServiceProvidingGroupGridPrequalificationCommentVisibility.SAME_PARTY,
            content="test2",
        ),
    )
    assert isinstance(spggpc2, ServiceProvidingGroupGridPrequalificationComment)

    # FISO can read and update both
    # endpoint: GET /service_providing_group_grid_prequalification_comment
    spggpcs = list_service_providing_group_grid_prequalification_comment.sync(
        client=client_fiso,
    )
    assert isinstance(spggpcs, list)
    assert len(spggpcs) > 0

    # endpoint: GET /service_providing_group_grid_prequalification_comment/{id}
    spggpc1 = read_service_providing_group_grid_prequalification_comment.sync(
        client=client_fiso,
        id=cast(int, spggpc1.id),
    )
    assert isinstance(spggpc1, ServiceProvidingGroupGridPrequalificationComment)

    # endpoint: PATCH /service_providing_group_grid_prequalification_comment/{id}
    u = update_service_providing_group_grid_prequalification_comment.sync(
        client=client_fiso,
        id=cast(int, spggpc1.id),
        body=ServiceProvidingGroupGridPrequalificationCommentUpdateRequest(
            content="test1 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_providing_group_grid_prequalification_comment.sync(
        client=client_fiso,
        id=cast(int, spggpc2.id),
        body=ServiceProvidingGroupGridPrequalificationCommentUpdateRequest(
            content="test2 EDITED",
        ),
    )
    assert isinstance(u, ServiceProvidingGroupGridPrequalificationComment)
    assert u.content == "test2 EDITED"

    # RLS: SPGGPC-FISO002
    assert check_history(client_fiso, spggpc1.id)


def test_spggp_comment_so_sp(data):
    (sts, client_so, client_sp, spggp_id, unrelated_spggp_id) = data

    # RLS: SPGGPC-COM001
    #   is also tested here because parties update their comments (visibility)

    # RLS: SPGGPC-SO001
    # RLS: SPGGPC-SP001
    #   are also tested here because both SO and SP create comments

    # SO and SP both create an open comment

    spggp_comment_so = create_service_providing_group_grid_prequalification_comment.sync(
        client=client_so,
        body=ServiceProvidingGroupGridPrequalificationCommentCreateRequest(
            service_providing_group_grid_prequalification_id=spggp_id,
            visibility=ServiceProvidingGroupGridPrequalificationCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SO",
        ),
    )
    assert isinstance(
        spggp_comment_so, ServiceProvidingGroupGridPrequalificationComment
    )

    spggp_comment_sp = create_service_providing_group_grid_prequalification_comment.sync(
        client=client_sp,
        body=ServiceProvidingGroupGridPrequalificationCommentCreateRequest(
            service_providing_group_grid_prequalification_id=spggp_id,
            visibility=ServiceProvidingGroupGridPrequalificationCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SP",
        ),
    )
    assert isinstance(
        spggp_comment_sp, ServiceProvidingGroupGridPrequalificationComment
    )

    # both can read each other's comments

    spggp_comment_so_as_sp = (
        read_service_providing_group_grid_prequalification_comment.sync(
            client=client_sp,
            id=cast(int, spggp_comment_so.id),
        )
    )
    assert isinstance(
        spggp_comment_so_as_sp, ServiceProvidingGroupGridPrequalificationComment
    )

    spggp_comment_sp_as_so = (
        read_service_providing_group_grid_prequalification_comment.sync(
            client=client_so,
            id=cast(int, spggp_comment_sp.id),
        )
    )
    assert isinstance(
        spggp_comment_sp_as_so, ServiceProvidingGroupGridPrequalificationComment
    )

    # SO's comment becomes open to this SO only

    updated_sppgc_comment_so = update_service_providing_group_grid_prequalification_comment.sync(
        client=client_so,
        id=cast(int, spggp_comment_so.id),
        body=ServiceProvidingGroupGridPrequalificationCommentUpdateRequest(
            visibility=ServiceProvidingGroupGridPrequalificationCommentVisibility.SAME_PARTY,
        ),
    )
    assert not isinstance(updated_sppgc_comment_so, ErrorMessage)

    # SP should not be able to read it

    spggp_comment_so_as_sp = (
        read_service_providing_group_grid_prequalification_comment.sync(
            client=client_sp,
            id=cast(int, spggp_comment_so.id),
        )
    )
    assert isinstance(spggp_comment_so_as_sp, ErrorMessage)
    # check they cannot read anything from the unrelated SPGGP

    unrelated_spggp_comment_as_so = (
        list_service_providing_group_grid_prequalification_comment.sync(
            client=client_so,
            service_providing_group_grid_prequalification_id=f"eq.{unrelated_spggp_id}",
        )
    )
    assert isinstance(unrelated_spggp_comment_as_so, list)
    assert len(unrelated_spggp_comment_as_so) == 0

    unrelated_spggp_comment_as_sp = (
        list_service_providing_group_grid_prequalification_comment.sync(
            client=client_sp,
            service_providing_group_grid_prequalification_id=f"eq.{unrelated_spggp_id}",
        )
    )
    assert isinstance(unrelated_spggp_comment_as_sp, list)
    assert len(unrelated_spggp_comment_as_sp) == 0

    # RLS: SPGGPC-SO003
    # RLS: SPGGPC-SP003

    # SO can read history on SP's comment because it is public
    assert check_history(client_so, spggp_comment_sp.id)
    # but SP cannot read history on SO's comment because it is now private
    assert not check_history(client_sp, spggp_comment_so.id)

    # SO makes comment public again
    updated_sppgc_comment_so = update_service_providing_group_grid_prequalification_comment.sync(
        client=client_so,
        id=cast(int, spggp_comment_so.id),
        body=ServiceProvidingGroupGridPrequalificationCommentUpdateRequest(
            visibility=ServiceProvidingGroupGridPrequalificationCommentVisibility.ANY_INVOLVED_PARTY,
        ),
    )
    assert not isinstance(updated_sppgc_comment_so, ErrorMessage)

    # now SP can read history
    assert check_history(client_sp, spggp_comment_so.id)
