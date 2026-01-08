from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnit,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProvider,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroup,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupBiddingZone,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductType,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplication,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembership,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplication,
    ServiceProvidingGroupProductApplicationUpdateRequest,
    ServiceProvidingGroupProductApplicationStatus,
    ServiceProvidingGroupProductSuspensionCreateRequest,
    ServiceProvidingGroupProductSuspension,
    ServiceProvidingGroupProductSuspensionReason,
    ServiceProvidingGroupProductSuspensionCommentCreateRequest,
    ServiceProvidingGroupProductSuspensionCommentVisibility,
    ServiceProvidingGroupProductSuspensionComment,
    ServiceProvidingGroupProductSuspensionCommentUpdateRequest,
    ServiceProvidingGroupProductSuspensionCommentHistory,
    ErrorMessage,
    EmptyObject,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    update_service_providing_group,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)
from flex.api.service_providing_group_product_application import (
    create_service_providing_group_product_application,
    update_service_providing_group_product_application,
)
from flex.api.service_providing_group_product_suspension import (
    create_service_providing_group_product_suspension,
    delete_service_providing_group_product_suspension,
)
from flex.api.service_providing_group_product_suspension_comment import (
    create_service_providing_group_product_suspension_comment,
    list_service_providing_group_product_suspension_comment,
    read_service_providing_group_product_suspension_comment,
    update_service_providing_group_product_suspension_comment,
    list_service_providing_group_product_suspension_comment_history,
    read_service_providing_group_product_suspension_comment_history,
)
from flex import AuthenticatedClient
import pytest
from typing import cast


def create_spgps(client_fiso, sp, so, ap_id, eu_id):
    (client_sp, sp_id) = sp
    (client_so, so_id) = so

    # chain of dependency to be able to create SPG product suspensions:
    #   see test for SPG product suspension

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPGPS-1",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroup)

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CU-SPGPS-1",
            accounting_point_id=ap_id,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnit)

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT-SPGPS-1",
            valid_from="2024-01-01T00:00:00+1",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProvider)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T00:00:00+1",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembership)

    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            name="TEST-SPG-SUSP-1 ACTIVATED",
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    sopt = create_system_operator_product_type.sync(
        client=client_so,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=4,
        ),
    )
    assert isinstance(sopt, SystemOperatorProductType)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[4],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplication)

    u = update_service_provider_product_application.sync(
        client=client_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2024-01-01T00:00:00+1",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # create and qualify the application

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg.id,
            procuring_system_operator_id=so_id,
            product_type_ids=[4],
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplication)

    u = update_service_providing_group_product_application.sync(
        client=client_so,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
            prequalified_at="2024-01-01T00:00:00+1",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    spgps = create_service_providing_group_product_suspension.sync(
        client=client_fiso,
        body=ServiceProvidingGroupProductSuspensionCreateRequest(
            procuring_system_operator_id=so_id,
            service_providing_group_id=spg.id,
            product_type_ids=[4],
            reason=ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION,
        ),
    )
    assert isinstance(spgps, ServiceProvidingGroupProductSuspension)

    return spgps.id


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    client_so = cast(AuthenticatedClient, sts.fresh_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # create a suspension

    spgps_id = create_spgps(
        client_fiso, (client_sp, sp_id), (client_so, so_id), 1002, eu_id
    )

    # create a totally unrelated suspension

    client_common_so = cast(
        AuthenticatedClient, sts.fresh_client(TestEntity.COMMON, "SO")
    )
    common_so_id = sts.get_userinfo(client_common_so)["party_id"]

    client_other_sp = sts.fresh_client(TestEntity.COMMON, "SP")
    other_sp_id = sts.get_userinfo(client_other_sp)["party_id"]

    unrelated_spgps_id = create_spgps(
        client_fiso,
        (client_other_sp, other_sp_id),
        (client_common_so, common_so_id),
        1002,
        eu_id,
    )

    yield (sts, client_so, client_sp, spgps_id, unrelated_spgps_id)


# ---- ---- ---- ---- ----


def check_history(clt, spggsc_id):
    # endpoint: GET /service_providing_group_product_suspension_comment_history
    h = list_service_providing_group_product_suspension_comment_history.sync(
        client=clt,
        service_providing_group_product_suspension_comment_id=f"eq.{spggsc_id}",
    )
    if not isinstance(h, list) or len(h) == 0:
        return False

    # endpoint: GET /service_providing_group_product_suspension_comment_history/{id}
    h1 = read_service_providing_group_product_suspension_comment_history.sync(
        client=clt,
        id=cast(int, h[0].id),
    )
    return isinstance(
        h1,
        ServiceProvidingGroupProductSuspensionCommentHistory,
    )


# RLS: SPGPSC-FISO001
def test_spgpsc_fiso(data):
    (sts, client_so, _, spgps_id, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # both parties create a comment
    # (minimal visibility so the test is even more powerful)

    # endpoint: POST /service_providing_group_product_suspension_comment
    spgpsc1 = create_service_providing_group_product_suspension_comment.sync(
        client=client_fiso,
        body=ServiceProvidingGroupProductSuspensionCommentCreateRequest(
            service_providing_group_product_suspension_id=spgps_id,
            visibility=ServiceProvidingGroupProductSuspensionCommentVisibility.SAME_PARTY,
            content="test1",
        ),
    )
    assert isinstance(spgpsc1, ServiceProvidingGroupProductSuspensionComment)

    spgpsc2 = create_service_providing_group_product_suspension_comment.sync(
        client=client_so,
        body=ServiceProvidingGroupProductSuspensionCommentCreateRequest(
            service_providing_group_product_suspension_id=spgps_id,
            visibility=ServiceProvidingGroupProductSuspensionCommentVisibility.SAME_PARTY,
            content="test2",
        ),
    )
    assert isinstance(spgpsc2, ServiceProvidingGroupProductSuspensionComment)

    # FISO can read and update both
    # endpoint: GET /service_providing_group_product_suspension_comment
    spgpscs = list_service_providing_group_product_suspension_comment.sync(
        client=client_fiso,
    )
    assert isinstance(spgpscs, list)
    assert len(spgpscs) > 0

    # endpoint: GET /service_providing_group_product_suspension_comment/{id}
    spgpsc1 = read_service_providing_group_product_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, spgpsc1.id),
    )
    assert isinstance(spgpsc1, ServiceProvidingGroupProductSuspensionComment)

    # endpoint: PATCH /service_providing_group_product_suspension_comment/{id}
    u = update_service_providing_group_product_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, spgpsc1.id),
        body=ServiceProvidingGroupProductSuspensionCommentUpdateRequest(
            content="test1 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_providing_group_product_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, spgpsc2.id),
        body=ServiceProvidingGroupProductSuspensionCommentUpdateRequest(
            content="test2 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGPSC-FISO002
    assert check_history(client_fiso, spgpsc1.id)

    # ensure that deleting the suspension also deletes the comments
    d = delete_service_providing_group_product_suspension.sync(
        client=client_fiso,
        id=spgps_id,
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    comments = list_service_providing_group_product_suspension_comment.sync(
        client=client_fiso,
        service_providing_group_product_suspension_id=f"eq.{spgps_id}",
    )
    assert isinstance(comments, list)
    assert len(comments) == 0

    assert check_history(client_fiso, spgpsc1.id)


# RLS: SPGPSC-SO002
# RLS: SPGPSC-SP002
def test_spgpsc_so_sp(data):
    (sts, client_so, client_sp, spgps_id, unrelated_spgps_id) = data

    # RLS: SPGPSC-COM001
    #   is also tested here because parties update their comments (visibility)

    # RLS: SPGPSC-SO001
    # RLS: SPGPSC-SP001
    #   are also tested here because both SO and SP create comments

    # SO and SP both create an open comment

    spgpsc_so = create_service_providing_group_product_suspension_comment.sync(
        client=client_so,
        body=ServiceProvidingGroupProductSuspensionCommentCreateRequest(
            service_providing_group_product_suspension_id=spgps_id,
            visibility=ServiceProvidingGroupProductSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SO",
        ),
    )
    assert isinstance(spgpsc_so, ServiceProvidingGroupProductSuspensionComment)

    spgpsc_sp = create_service_providing_group_product_suspension_comment.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductSuspensionCommentCreateRequest(
            service_providing_group_product_suspension_id=spgps_id,
            visibility=ServiceProvidingGroupProductSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
            content="Comment SP",
        ),
    )
    assert isinstance(spgpsc_sp, ServiceProvidingGroupProductSuspensionComment)

    # both can read each other's comments

    spgpsc_so_as_sp = read_service_providing_group_product_suspension_comment.sync(
        client=client_sp,
        id=cast(int, spgpsc_so.id),
    )
    assert isinstance(spgpsc_so_as_sp, ServiceProvidingGroupProductSuspensionComment)

    spgpsc_sp_as_so = read_service_providing_group_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, spgpsc_sp.id),
    )
    assert isinstance(spgpsc_sp_as_so, ServiceProvidingGroupProductSuspensionComment)

    # SO's comment becomes open to this SO only

    u = update_service_providing_group_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, spgpsc_so.id),
        body=ServiceProvidingGroupProductSuspensionCommentUpdateRequest(
            visibility=ServiceProvidingGroupProductSuspensionCommentVisibility.SAME_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SP should not be able to read it

    spgpsc_so_as_sp = read_service_providing_group_product_suspension_comment.sync(
        client=client_sp,
        id=cast(int, spgpsc_so.id),
    )
    assert isinstance(spgpsc_so_as_sp, ErrorMessage)

    # check they cannot read anything from the unrelated SPGGS

    uspgpscs_as_so = list_service_providing_group_product_suspension_comment.sync(
        client=client_so,
        service_providing_group_product_suspension_id=f"eq.{unrelated_spgps_id}",
    )
    assert isinstance(uspgpscs_as_so, list)
    assert len(uspgpscs_as_so) == 0

    uspgpscs_as_sp = list_service_providing_group_product_suspension_comment.sync(
        client=client_sp,
        service_providing_group_product_suspension_id=f"eq.{unrelated_spgps_id}",
    )
    assert isinstance(uspgpscs_as_sp, list)
    assert len(uspgpscs_as_sp) == 0

    # RLS: SPGPSC-SO003
    # RLS: SPGPSC-SP003

    # SO can read history on SP's comment because it is public
    assert check_history(client_so, spgpsc_sp.id)
    # but SP cannot read history on SO's comment because it is now private
    assert not check_history(client_sp, spgpsc_so.id)

    # SO makes comment public again
    u = update_service_providing_group_product_suspension_comment.sync(
        client=client_so,
        id=cast(int, spgpsc_so.id),
        body=ServiceProvidingGroupProductSuspensionCommentUpdateRequest(
            visibility=ServiceProvidingGroupProductSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # now SP can read history
    assert check_history(client_sp, spgpsc_so.id)

    # delete the SPPS so that comments disappear
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    d = delete_service_providing_group_product_suspension.sync(
        client=client_fiso,
        id=spgps_id,
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    # history is still reachable
    check_history(client_sp, spgpsc_so.id)
    check_history(client_so, spgpsc_sp.id)
