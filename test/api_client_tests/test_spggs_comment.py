from security_token_service import (
    SecurityTokenService,
    AuthenticatedClient,
    TestEntity,
)
from flex.models import (
    ServiceProvidingGroupGridSuspensionResponse,
    ServiceProvidingGroupGridSuspensionCreateRequest,
    ServiceProvidingGroupGridSuspensionReason,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupGridPrequalificationUpdateRequest,
    ServiceProvidingGroupGridPrequalificationStatus,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ServiceProvidingGroupGridSuspensionCommentCreateRequest,
    ServiceProvidingGroupGridSuspensionCommentVisibility,
    ServiceProvidingGroupGridSuspensionCommentResponse,
    ServiceProvidingGroupGridSuspensionCommentUpdateRequest,
    ServiceProvidingGroupGridSuspensionCommentHistoryResponse,
    ErrorMessage,
    EmptyObject,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    update_service_providing_group,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.service_providing_group_grid_prequalification import (
    list_service_providing_group_grid_prequalification,
    update_service_providing_group_grid_prequalification,
)
from flex.api.service_providing_group_grid_suspension import (
    create_service_providing_group_grid_suspension,
    delete_service_providing_group_grid_suspension,
)
from flex.api.service_providing_group_grid_suspension_comment import (
    list_service_providing_group_grid_suspension_comment,
    read_service_providing_group_grid_suspension_comment,
    update_service_providing_group_grid_suspension_comment,
    create_service_providing_group_grid_suspension_comment,
    list_service_providing_group_grid_suspension_comment_history,
    read_service_providing_group_grid_suspension_comment_history,
)
import datetime
import pytest
from typing import cast


def create_spggs(client_fiso, client_sp, sp_id, ap_id, eu_id, so_id):
    # chain of dependency to be able to create SPG grid suspensions:
    #   SPG -> CU -> CUSP -> SPGM -> active SPG -> SPGGP -> suspension

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-SUSP-1",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CU-SUSP-1",
            accounting_point_id=ap_id,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT-SUSP-1",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    # activate the SPG and get the SPGGP created automatically

    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            name="TEST-SPG-SUSP-1 ACTIVATED",
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    spggps = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        service_providing_group_id=f"eq.{spg.id}",
    )
    assert isinstance(spggps, list)
    assert len(spggps) == 1

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggps[0].id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS,
            prequalified_at=datetime.datetime.fromisoformat(
                "2025-01-01T00:00:00+01:00"
            ),
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    spggs = create_service_providing_group_grid_suspension.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridSuspensionCreateRequest(
            impacted_system_operator_id=so_id,
            service_providing_group_id=spg.id,
            reason=ServiceProvidingGroupGridSuspensionReason.BREACH_OF_CONDITIONS,
        ),
    )
    assert isinstance(spggs, ServiceProvidingGroupGridSuspensionResponse)

    return spggs.id


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    client_so = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # create a suspension

    spggs_id = create_spggs(client_fiso, client_sp, sp_id, 1002, eu_id, so_id)

    # create a totally unrelated suspension

    client_common_so = cast(
        AuthenticatedClient, sts.get_client(TestEntity.COMMON, "SO")
    )
    common_so_id = sts.get_userinfo(client_common_so)["party_id"]

    client_other_sp = sts.fresh_client(TestEntity.COMMON, "SP")
    other_sp_id = sts.get_userinfo(client_other_sp)["party_id"]

    client_common_eu = cast(
        AuthenticatedClient, sts.get_client(TestEntity.COMMON, "EU")
    )
    common_eu_id = sts.get_userinfo(client_common_eu)["party_id"]

    unrelated_spggs_id = create_spggs(
        client_fiso,
        client_other_sp,
        other_sp_id,
        2,
        common_eu_id,
        common_so_id,
    )

    yield (sts, client_so, client_sp, spggs_id, unrelated_spggs_id)


# ---- ---- ---- ---- ----


def check_history(clt, spggsc_id):
    # endpoint: GET /service_providing_group_grid_suspension_comment_history
    h = list_service_providing_group_grid_suspension_comment_history.sync(
        client=clt,
        service_providing_group_grid_suspension_comment_id=f"eq.{spggsc_id}",
    )
    if not isinstance(h, list) or len(h) == 0:
        return False

    # endpoint: GET /service_providing_group_grid_suspension_comment_history/{id}
    h1 = read_service_providing_group_grid_suspension_comment_history.sync(
        client=clt,
        id=cast(int, h[0].id),
    )
    return isinstance(
        h1,
        ServiceProvidingGroupGridSuspensionCommentHistoryResponse,
    )


# RLS: SPGGSC-FISO001
def test_spggsc_fiso(data):
    (sts, client_so, _, spggs_id, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # both parties create a comment
    # (minimal visibility so the test is even more powerful)

    # endpoint: POST /service_providing_group_grid_suspension_comment
    spggsc1 = create_service_providing_group_grid_suspension_comment.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridSuspensionCommentCreateRequest(
            service_providing_group_grid_suspension_id=spggs_id,
            visibility=ServiceProvidingGroupGridSuspensionCommentVisibility.SAME_PARTY,
            content="test1",
        ),
    )
    assert isinstance(spggsc1, ServiceProvidingGroupGridSuspensionCommentResponse)

    spggsc2 = create_service_providing_group_grid_suspension_comment.sync(
        client=client_so,
        body=ServiceProvidingGroupGridSuspensionCommentCreateRequest(
            service_providing_group_grid_suspension_id=spggs_id,
            visibility=ServiceProvidingGroupGridSuspensionCommentVisibility.SAME_PARTY,
            content="test2",
        ),
    )
    assert isinstance(spggsc2, ServiceProvidingGroupGridSuspensionCommentResponse)

    # FISO can read and update both
    # endpoint: GET /service_providing_group_grid_suspension_comment
    spggscs = list_service_providing_group_grid_suspension_comment.sync(
        client=client_fiso,
    )
    assert isinstance(spggscs, list)
    assert len(spggscs) > 0

    # endpoint: GET /service_providing_group_grid_suspension_comment/{id}
    spggsc1 = read_service_providing_group_grid_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, spggsc1.id),
    )
    assert isinstance(spggsc1, ServiceProvidingGroupGridSuspensionCommentResponse)

    # endpoint: PATCH /service_providing_group_grid_suspension_comment/{id}
    u = update_service_providing_group_grid_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, spggsc1.id),
        body=ServiceProvidingGroupGridSuspensionCommentUpdateRequest(
            content="test1 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_providing_group_grid_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, spggsc2.id),
        body=ServiceProvidingGroupGridSuspensionCommentUpdateRequest(
            content="test2 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGGSC-FISO002
    assert check_history(client_fiso, spggsc1.id)

    # ensure that deleting the suspension also deletes the comments
    d = delete_service_providing_group_grid_suspension.sync(
        client=client_fiso,
        id=spggs_id,
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    comments = list_service_providing_group_grid_suspension_comment.sync(
        client=client_fiso,
        service_providing_group_grid_suspension_id=f"eq.{spggs_id}",
    )
    assert isinstance(comments, list)
    assert len(comments) == 0

    assert check_history(client_fiso, spggsc1.id)


# RLS: SPGGSC-SO002
# RLS: SPGGSC-SP002
def test_spggsc_so_sp(data):
    (sts, client_so, client_sp, spggs_id, unrelated_spggs_id) = data

    # RLS: SPGGSC-COM001
    #   is also tested here because parties update their comments (visibility)

    # RLS: SPGGSC-SO001
    # RLS: SPGGSC-SP001
    #   are also tested here because both SO and SP create comments

    # SO and SP both create an open comment

    spggsc_so = create_service_providing_group_grid_suspension_comment.sync(
        client=client_so,
        body=ServiceProvidingGroupGridSuspensionCommentCreateRequest(
            service_providing_group_grid_suspension_id=spggs_id,
            visibility=ServiceProvidingGroupGridSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SO",
        ),
    )
    assert isinstance(spggsc_so, ServiceProvidingGroupGridSuspensionCommentResponse)

    spggsc_sp = create_service_providing_group_grid_suspension_comment.sync(
        client=client_sp,
        body=ServiceProvidingGroupGridSuspensionCommentCreateRequest(
            service_providing_group_grid_suspension_id=spggs_id,
            visibility=ServiceProvidingGroupGridSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SP",
        ),
    )
    assert isinstance(spggsc_sp, ServiceProvidingGroupGridSuspensionCommentResponse)

    # both can read each other's comments

    spggsc_so_as_sp = read_service_providing_group_grid_suspension_comment.sync(
        client=client_sp,
        id=cast(int, spggsc_so.id),
    )
    assert isinstance(
        spggsc_so_as_sp, ServiceProvidingGroupGridSuspensionCommentResponse
    )

    spggsc_sp_as_so = read_service_providing_group_grid_suspension_comment.sync(
        client=client_so,
        id=cast(int, spggsc_sp.id),
    )
    assert isinstance(
        spggsc_sp_as_so, ServiceProvidingGroupGridSuspensionCommentResponse
    )

    # SO's comment becomes open to this SO only

    u = update_service_providing_group_grid_suspension_comment.sync(
        client=client_so,
        id=cast(int, spggsc_so.id),
        body=ServiceProvidingGroupGridSuspensionCommentUpdateRequest(
            visibility=ServiceProvidingGroupGridSuspensionCommentVisibility.SAME_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SP should not be able to read it

    spggsc_so_as_sp = read_service_providing_group_grid_suspension_comment.sync(
        client=client_sp,
        id=cast(int, spggsc_so.id),
    )
    assert isinstance(spggsc_so_as_sp, ErrorMessage)

    # check they cannot read anything from the unrelated SPGGS

    uspggscs_as_so = list_service_providing_group_grid_suspension_comment.sync(
        client=client_so,
        service_providing_group_grid_suspension_id=f"eq.{unrelated_spggs_id}",
    )
    assert isinstance(uspggscs_as_so, list)
    assert len(uspggscs_as_so) == 0

    uspggscs_as_sp = list_service_providing_group_grid_suspension_comment.sync(
        client=client_sp,
        service_providing_group_grid_suspension_id=f"eq.{unrelated_spggs_id}",
    )
    assert isinstance(uspggscs_as_sp, list)
    assert len(uspggscs_as_sp) == 0

    # RLS: SPGGSC-SO003
    # RLS: SPGGSC-SP003

    # SO can read history on SP's comment because it is public
    assert check_history(client_so, spggsc_sp.id)
    # but SP cannot read history on SO's comment because it is now private
    assert not check_history(client_sp, spggsc_so.id)

    # SO makes comment public again
    u = update_service_providing_group_grid_suspension_comment.sync(
        client=client_so,
        id=cast(int, spggsc_so.id),
        body=ServiceProvidingGroupGridSuspensionCommentUpdateRequest(
            visibility=ServiceProvidingGroupGridSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # now SP can read history
    assert check_history(client_sp, spggsc_so.id)

    # delete the SPPS so that comments disappear
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    d = delete_service_providing_group_grid_suspension.sync(
        client=client_fiso,
        id=spggs_id,
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    # history is still reachable
    check_history(client_sp, spggsc_so.id)
    check_history(client_so, spggsc_sp.id)
