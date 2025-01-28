from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupStatus,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplicationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationResponse,
    ServiceProvidingGroupProductApplicationUpdateRequest,
    ServiceProvidingGroupProductApplicationStatus,
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
    delete_service_providing_group_membership,
)
from flex.api.service_providing_group import (
    read_service_providing_group,
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
    list_service_providing_group_product_application,
    read_service_providing_group_product_application,
    update_service_providing_group_product_application,
)
from flex import AuthenticatedClient
import pytest
from typing import cast


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(
        AuthenticatedClient,
        sts.get_client(TestEntity.TEST, "FISO"),
    )

    client_sp = cast(
        AuthenticatedClient,
        sts.fresh_client(TestEntity.TEST, "SP"),
    )
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_so = cast(
        AuthenticatedClient,
        sts.fresh_client(TestEntity.TEST, "SO"),
    )
    so_id = sts.get_userinfo(client_so)["party_id"]

    # create an SPG and activate it
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            valid_from="2024-01-01T08:00:00+00:00",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-12",
            service_provider_id=sp_id,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    # SO cannot read the SPG yet (cf SPG RLS below)
    err = read_service_providing_group.sync(
        client=client_so,
        id=cast(int, spg.id),
    )
    assert isinstance(err, ErrorMessage)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T08:01:00+00:00",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # apply for a product type for the SO and qualify this application

    # random choice of product type, it does not matter
    pt_id = 7

    sopt = create_system_operator_product_type.sync(
        client=client_so,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=pt_id,
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[pt_id],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    yield (sts, spg.id, spgm.id, client_sp, client_so, so_id, pt_id)


# ---- ---- ---- ---- ----


# test FISO, SP and SO together because FISO and SO cannot create
# so we must get SP to do something before FISO and SO can do anything
def test_spgpa_fiso_sp_so(data):
    (sts, spg_id, spgm_id, client_sp, client_so, so_id, pt_id) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_other_so = sts.get_client(TestEntity.TEST, "SO")

    # no one but SP can create SPGPA
    spgpa = create_service_providing_group_product_application.sync(
        client=client_so,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_id,
            procuring_system_operator_id=so_id,
            product_type_id=pt_id,
        ),
    )
    assert isinstance(spgpa, ErrorMessage)

    # SP can create and read a SPGPA
    # RLS: SPGPA-SP001
    # endpoint: POST /service_providing_group_product_application
    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_id,
            procuring_system_operator_id=so_id,
            product_type_id=pt_id,
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    # endpoint: GET /service_providing_group_product_application/{id}
    spgpa = read_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    # RLS: SPG-SO002
    # BTW now SO can read the SPG
    spg = read_service_providing_group.sync(client=client_so, id=spg_id)
    assert isinstance(spg, ServiceProvidingGroupResponse)

    # other SO can read
    # RLS: SPGPA-SO001
    spgpa = read_service_providing_group_product_application.sync(
        client=client_other_so,
        id=cast(int, spgpa.id),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    # but not update
    # RLS: SPGPA-SO002
    u = update_service_providing_group_product_application.sync(
        client=client_other_so,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # the first SO can update
    # endpoint: PATCH /service_providing_group_product_application/{id}
    u = update_service_providing_group_product_application.sync(
        client=client_so,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SP cannot update when the status is not rejected
    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.IN_PROGRESS,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # FISO can read and update
    # RLS: SPGPA-FISO001
    # endpoint: GET /service_providing_group_product_application
    spgpas = list_service_providing_group_product_application.sync(
        client=client_fiso,
    )
    assert isinstance(spgpas, list)
    assert len(spgpas) > 0

    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            notes="test notes by FISO",
            status=ServiceProvidingGroupProductApplicationStatus.REJECTED,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # last part of SPGPA-SP001 : SP can reset a rejected application

    # (cannot update to anything else than requested)
    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.IN_PROGRESS,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # rejected -> requested : ok
    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.REQUESTED,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # just to trigger notification to SO
    d = delete_service_providing_group_membership.sync(
        client=client_fiso,
        id=cast(int, spgm_id),
        body=EmptyObject(),
    )
    assert not (isinstance(d, ErrorMessage))


# def test_spgpa_common(data):
#     (sts, _, _, _, _, _, _) = data

#     for role in sts.COMMON_ROLES:
#         client = sts.get_client(TestEntity.TEST, role)

#         spgpa_visible = list_service_providing_group_product_application.sync(
#             client=client,
#         )
#         assert isinstance(spgpa_visible, list)

#         # RLS: SPGPA-COM001
#         # can read history on SPGPA they can read
#         # only checking a few entries is sufficient
#         for spgpa in spgpa_visible[:5]:
#             # endpoint: GET /service_providing_group_product_application_history
#             hist = list_service_providing_group_product_application_history.sync(
#                 client=client,
#                 service_providing_group_product_application_id=f"eq.{spgpa.id}",
#             )
#             assert isinstance(hist, list)
#             assert len(hist) > 0

#             # endpoint: GET /service_providing_group_product_application_history/{id}
#             hist_spgpa = read_service_providing_group_product_application_history.sync(
#                 client=client,
#                 id=cast(int, hist[0].id),
#             )
#             assert isinstance(
#                 hist_spgpa,
#                 ServiceProvidingGroupProductApplicationHistoryResponse,
#             )
