from security_token_service import (
    SecurityTokenService,
    AuthenticatedClient,
    TestEntity,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitUpdateRequest,
    ControllableUnitStatus,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ControllableUnitSuspensionCommentCreateRequest,
    ControllableUnitSuspensionCommentUpdateRequest,
    ControllableUnitSuspensionCommentResponse,
    ControllableUnitSuspensionCommentVisibility,
    ControllableUnitSuspensionCommentHistoryResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
    ErrorMessage,
)
from flex.models import (
    ControllableUnitSuspensionCreateRequest,
    ControllableUnitSuspensionResponse,
    ControllableUnitSuspensionReason,
)
from flex.api.controllable_unit_suspension import create_controllable_unit_suspension
from flex.api.controllable_unit_suspension_comment import (
    read_controllable_unit_suspension_comment,
    update_controllable_unit_suspension_comment,
    create_controllable_unit_suspension_comment,
    list_controllable_unit_suspension_comment,
    list_controllable_unit_suspension_comment_history,
    read_controllable_unit_suspension_comment_history,
)

from flex.api.controllable_unit import (
    create_controllable_unit,
    update_controllable_unit,
)
from flex.api.technical_resource import create_technical_resource
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from typing import cast
import datetime
import pytest


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

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CU-SUSP-1",
            accounting_point_id=1002,  # managed by Test SO
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

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
        ),
    )
    assert not isinstance(u, ErrorMessage)

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

    yield (sts, cu.id, (client_so, so_id), (client_sp, sp_id))


# ---- ---- ---- ---- ----


def check_history(client, cusc_id):
    # endpoint: GET /controllable_unit_suspension_history
    hist = list_controllable_unit_suspension_comment_history.sync(
        client=client,
        controllable_unit_suspension_id=f"eq.{cusc_id}",
    )
    assert isinstance(hist, list)
    assert len(hist) > 0

    # endpoint: GET /controllable_unit_suspension_history/{id}
    hist_cus = read_controllable_unit_suspension_comment_history.sync(
        client=client,
        id=cast(int, hist[0].id),
    )
    assert isinstance(
        hist_cus,
        ControllableUnitSuspensionCommentHistoryResponse,
    )


# RLS: CUS-FISO001
def test_cus_fiso(data):
    (sts, cu_id, (_, so_id), _) = data

    client_fiso = sts.fresh_client(TestEntity.TEST, "FISO")

    # endpoint: POST /service_providing_group_grid_suspension
    cus = create_controllable_unit_suspension.sync(
        client=client_fiso,
        body=ControllableUnitSuspensionCreateRequest(
            controllable_unit_id=cu_id,
            impacted_system_operator_id=so_id,
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    cusc = create_controllable_unit_suspension_comment.sync(
        client=client_fiso,
        body=ControllableUnitSuspensionCommentCreateRequest(
            controllable_unit_suspension_id=cast(int, cus.id),
            visibility=ControllableUnitSuspensionCommentVisibility.SAME_PARTY,
            content="This is a test comment",
        ),
    )
    assert isinstance(cusc, ControllableUnitSuspensionCommentResponse)
    # FISO can read and update both
    # endpoint: GET /controllable_unit_suspension_comment
    cuscs = list_controllable_unit_suspension_comment.sync(
        client=client_fiso,
    )
    assert isinstance(cuscs, list)
    assert len(cuscs) > 0

    # endpoint: GET /controllable_unit_suspension_comment/{id}
    cusc1 = read_controllable_unit_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, cusc.id),
    )
    assert isinstance(cusc1, ControllableUnitSuspensionCommentResponse)

    # endpoint: PATCH /controllable_unit_suspension_comment/{id}
    u = update_controllable_unit_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, cusc1.id),
        body=ControllableUnitSuspensionCommentUpdateRequest(
            content="test1 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_controllable_unit_suspension_comment.sync(
        client=client_fiso,
        id=cast(int, cusc1.id),
        body=ControllableUnitSuspensionCommentUpdateRequest(
            content="test2 EDITED",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: CUS-FISO002
    check_history(client_fiso, cus.id)


def test_cus_so_sp(data):
    (sts, cu_id, (client_so, so_id), (client_sp, sp_id)) = data

    # RLS: CUSC-COM001
    #   is also tested here because parties update their comments (visibility)

    # RLS: CUSC-SO001
    # RLS: CUSC-SP001
    #   is also tested here because both SO and SP create comments

    # SO and SP both create an open comment

    cus = create_controllable_unit_suspension.sync(
        client=client_so,
        body=ControllableUnitSuspensionCreateRequest(
            impacted_system_operator_id=so_id,
            controllable_unit_id=cu_id,
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    cusc = create_controllable_unit_suspension_comment.sync(
        client=client_so,
        body=ControllableUnitSuspensionCommentCreateRequest(
            controllable_unit_suspension_id=cast(int, cus.id),
            visibility=ControllableUnitSuspensionCommentVisibility.SAME_PARTY,
            content="This is a test comment",
        ),
    )
    assert isinstance(cusc, ControllableUnitSuspensionCommentResponse)
    # FISO can read and update both
    # endpoint: GET /controllable_unit_suspension_comment
    cuscs = list_controllable_unit_suspension_comment.sync(
        client=client_so,
    )
    assert isinstance(cuscs, list)
    assert len(cuscs) > 0

    # endpoint: GET /controllable_unit_suspension_comment/{id}
    cusc1 = read_controllable_unit_suspension_comment.sync(
        client=client_so,
        id=cast(int, cusc.id),
    )
    assert isinstance(cusc1, ControllableUnitSuspensionCommentResponse)

    so_comment_party_only = create_controllable_unit_suspension_comment.sync(
        client=client_so,
        body=ControllableUnitSuspensionCommentCreateRequest(
            controllable_unit_suspension_id=cast(int, cus.id),
            visibility=ControllableUnitSuspensionCommentVisibility.SAME_PARTY,
            content="This is a test comment from SO",
        ),
    )
    assert isinstance(so_comment_party_only, ControllableUnitSuspensionCommentResponse)

    sp_comment_party_only = create_controllable_unit_suspension_comment.sync(
        client=client_sp,
        body=ControllableUnitSuspensionCommentCreateRequest(
            controllable_unit_suspension_id=cast(int, cus.id),
            visibility=ControllableUnitSuspensionCommentVisibility.SAME_PARTY,
            content="This is a test comment from SP",
        ),
    )
    assert isinstance(sp_comment_party_only, ControllableUnitSuspensionCommentResponse)

    # both can read both comments only when visibility allows
    # RLS: CUSC-SP002
    # RLS: CUSC-SO002

    r_so = read_controllable_unit_suspension_comment.sync(
        client=client_so,
        id=cast(int, so_comment_party_only.id),
    )
    assert isinstance(r_so, ControllableUnitSuspensionCommentResponse)

    r_sp = read_controllable_unit_suspension_comment.sync(
        client=client_sp,
        id=cast(int, sp_comment_party_only.id),
    )
    assert isinstance(r_sp, ControllableUnitSuspensionCommentResponse)

    # both can update their own comments

    u_so = update_controllable_unit_suspension_comment.sync(
        client=client_so,
        id=cast(int, so_comment_party_only.id),
        body=ControllableUnitSuspensionCommentUpdateRequest(
            content="SO comment EDITED",
        ),
    )
    assert not isinstance(u_so, ErrorMessage)

    u_sp = update_controllable_unit_suspension_comment.sync(
        client=client_sp,
        id=cast(int, sp_comment_party_only.id),
        body=ControllableUnitSuspensionCommentUpdateRequest(
            content="SP comment EDITED",
        ),
    )
    assert not isinstance(u_sp, ErrorMessage)

    # both cannot read each other's comments
    r_so = read_controllable_unit_suspension_comment.sync(
        client=client_so,
        id=cast(int, sp_comment_party_only.id),
    )
    assert isinstance(r_so, ErrorMessage)  # check any involved.

    r_sp = read_controllable_unit_suspension_comment.sync(
        client=client_sp,
        id=cast(int, so_comment_party_only.id),
    )
    assert isinstance(r_sp, ErrorMessage)

    # check any involved
    so_comment_any_involved = create_controllable_unit_suspension_comment.sync(
        client=client_so,
        body=ControllableUnitSuspensionCommentCreateRequest(
            controllable_unit_suspension_id=cast(int, cus.id),
            visibility=ControllableUnitSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
            content="This is a test comment from SO that can be read by SP",
        ),
    )
    assert isinstance(
        so_comment_any_involved, ControllableUnitSuspensionCommentResponse
    )

    sp_comment_any_involved = create_controllable_unit_suspension_comment.sync(
        client=client_sp,
        body=ControllableUnitSuspensionCommentCreateRequest(
            controllable_unit_suspension_id=cast(int, cus.id),
            visibility=ControllableUnitSuspensionCommentVisibility.ANY_INVOLVED_PARTY,
            content="This is a test comment from SP that can be read by SO",
        ),
    )
    assert isinstance(
        sp_comment_any_involved, ControllableUnitSuspensionCommentResponse
    )

    r_so2 = read_controllable_unit_suspension_comment.sync(
        client=client_so,
        id=cast(int, sp_comment_any_involved.id),
    )
    assert isinstance(r_so2, ControllableUnitSuspensionCommentResponse)

    r_sp2 = read_controllable_unit_suspension_comment.sync(
        client=client_sp,
        id=cast(int, sp_comment_any_involved.id),
    )
    assert isinstance(r_sp2, ControllableUnitSuspensionCommentResponse)

    # but neither can update each other's comments

    # so cannot update sp comment
    u_so_error = update_controllable_unit_suspension_comment.sync(
        client=client_so,
        id=cast(int, sp_comment_any_involved.id),
        body=ControllableUnitSuspensionCommentUpdateRequest(
            content="SO comment EDITED",
        ),
    )
    assert isinstance(u_so_error, ErrorMessage)

    # sp cannot update so comment
    u_sp_error = update_controllable_unit_suspension_comment.sync(
        client=client_sp,
        id=cast(int, so_comment_any_involved.id),
        body=ControllableUnitSuspensionCommentUpdateRequest(
            content="SP comment EDITED",
        ),
    )
    assert isinstance(u_sp_error, ErrorMessage)

    # RLS: CUSC-SO003
    # RLS: CUSC-SP003
    check_history(client_so, cus.id)
    check_history(client_sp, cus.id)
