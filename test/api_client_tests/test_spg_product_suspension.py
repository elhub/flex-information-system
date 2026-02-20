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
    ServiceProvidingGroupBiddingZone,
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
    ServiceProvidingGroupProductSuspensionCreateRequest,
    ServiceProvidingGroupProductSuspensionResponse,
    ServiceProvidingGroupProductSuspensionUpdateRequest,
    ServiceProvidingGroupProductSuspensionReason,
    ServiceProvidingGroupProductSuspensionHistoryResponse,
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
    list_service_providing_group_product_suspension,
    read_service_providing_group_product_suspension,
    update_service_providing_group_product_suspension,
    delete_service_providing_group_product_suspension,
    list_service_providing_group_product_suspension_history,
    read_service_providing_group_product_suspension_history,
)
from flex import AuthenticatedClient
import datetime
import pytest
from typing import cast


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # chain of dependency to be able to create SPG product suspensions:
    # SPGPS
    #   <- SPGPA
    #        <- active SPG <- SPGM <- CUSP <- CU   [1]
    #        <- qualified SPPA <- SOPT             [2]

    # first line of dependencies [1]

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPGPS-1",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CU-SPGPS-1",
            accounting_point_id=1002,  # managed by Test SO
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
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT-SPGPS-1",
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

    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            name="TEST-SPG-SUSP-1 ACTIVATED",
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # second line of dependencies [2] dependent on SO
    def setup_dependencies(client_so, so_id, pt_ids):
        for pt_id in pt_ids:
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
                product_type_ids=pt_ids,
            ),
        )
        assert isinstance(sppa, ServiceProviderProductApplicationResponse)

        u = update_service_provider_product_application.sync(
            client=client_so,
            id=cast(int, sppa.id),
            body=ServiceProviderProductApplicationUpdateRequest(
                status=ServiceProviderProductApplicationStatus.QUALIFIED,
                qualified_at=datetime.datetime.fromisoformat(
                    "2024-01-01T00:00:00+01:00"
                ),
            ),
        )
        assert not isinstance(u, ErrorMessage)

        # create and qualify the application

        spgpa = create_service_providing_group_product_application.sync(
            client=client_sp,
            body=ServiceProvidingGroupProductApplicationCreateRequest(
                service_providing_group_id=spg.id,
                procuring_system_operator_id=so_id,
                product_type_ids=pt_ids,
                maximum_active_power=3.5,
            ),
        )
        assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

        u = update_service_providing_group_product_application.sync(
            client=client_so,
            id=cast(int, spgpa.id),
            body=ServiceProvidingGroupProductApplicationUpdateRequest(
                status=ServiceProvidingGroupProductApplicationStatus.IN_PROGRESS,
                prequalified_at=datetime.datetime.fromisoformat(
                    "2024-01-01T00:00:00+01:00"
                ),
            ),
        )
        assert not (isinstance(u, ErrorMessage))

    # we need 2 different SOs

    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_other_so = sts.fresh_client(TestEntity.COMMON, "SO")
    other_so_id = sts.get_userinfo(client_other_so)["party_id"]

    first_pt_id = 4

    # one common product type so we can test the difference when the suspension
    # is on this product type or another
    common_pt_id = 5

    setup_dependencies(client_so, so_id, [3, 4, 5])
    setup_dependencies(client_other_so, other_so_id, [5, 6])

    unqualified_pt_id = 1

    yield (
        sts,
        spg.id,
        (client_so, so_id),
        (client_other_so, other_so_id),
        (client_sp, sp_id),
        (first_pt_id, common_pt_id, unqualified_pt_id),
    )


# ---- ---- ---- ---- ----


def check_history(client, spgps_id):
    # endpoint: GET /service_providing_group_product_suspension_history
    hist = list_service_providing_group_product_suspension_history.sync(
        client=client,
        service_providing_group_product_suspension_id=f"eq.{spgps_id}",
    )
    assert isinstance(hist, list)
    assert len(hist) > 0

    # endpoint: GET /service_providing_group_product_suspension_history/{id}
    hist_spgps = read_service_providing_group_product_suspension_history.sync(
        client=client,
        id=cast(int, hist[0].id),
    )
    assert isinstance(
        hist_spgps,
        ServiceProvidingGroupProductSuspensionHistoryResponse,
    )


# RLS: SPGPS-FISO001
def test_spgps_fiso(data):
    (sts, spg_id, (_, so_id), _, _, (pt_id, _, unqualified_pt_id)) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # RLS: SPGPS-VAL001
    # cannot suspend an unqualified product type
    u = create_service_providing_group_product_suspension.sync(
        client=client_fiso,
        body=ServiceProvidingGroupProductSuspensionCreateRequest(
            procuring_system_operator_id=so_id,
            service_providing_group_id=spg_id,
            product_type_ids=[unqualified_pt_id],
            reason=ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # endpoint: POST /service_providing_group_product_suspension
    spgps = create_service_providing_group_product_suspension.sync(
        client=client_fiso,
        body=ServiceProvidingGroupProductSuspensionCreateRequest(
            procuring_system_operator_id=so_id,
            service_providing_group_id=spg_id,
            product_type_ids=[pt_id],
            reason=ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION,
        ),
    )
    assert isinstance(spgps, ServiceProvidingGroupProductSuspensionResponse)

    # endpoint: GET /service_providing_group_product_suspension
    spgpss = list_service_providing_group_product_suspension.sync(client=client_fiso)
    assert isinstance(spgpss, list)
    assert len(spgpss) > 0

    # endpoint: GET /service_providing_group_product_suspension/{id}
    s = read_service_providing_group_product_suspension.sync(
        client=client_fiso,
        id=cast(int, spgpss[0].id),
    )
    assert isinstance(s, ServiceProvidingGroupProductSuspensionResponse)

    # RLS: SPGPS-FISO002
    check_history(client_fiso, s.id)

    # endpoint: PATCH /service_providing_group_product_suspension/{id}
    u = update_service_providing_group_product_suspension.sync(
        client=client_fiso,
        id=cast(int, s.id),
        body=ServiceProvidingGroupProductSuspensionUpdateRequest(
            reason=ServiceProvidingGroupProductSuspensionReason.OTHER,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # endpoint: DELETE /service_providing_group_product_suspension/{id}
    d = delete_service_providing_group_product_suspension.sync(
        client=client_fiso, id=cast(int, s.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)


# RLS: SPGPS-SP001
def test_spgps_sp(data):
    (sts, spg_id, (_, so_id), _, (client_sp, _), (pt_id, _, _)) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    spgps = create_service_providing_group_product_suspension.sync(
        client=client_fiso,
        body=ServiceProvidingGroupProductSuspensionCreateRequest(
            procuring_system_operator_id=so_id,
            service_providing_group_id=spg_id,
            product_type_ids=[pt_id],
            reason=ServiceProvidingGroupProductSuspensionReason.OTHER,
        ),
    )
    assert isinstance(spgps, ServiceProvidingGroupProductSuspensionResponse)

    # SP can read

    spgps = read_service_providing_group_product_suspension.sync(
        client=client_sp,
        id=cast(int, spgps.id),
    )
    assert isinstance(spgps, ServiceProvidingGroupProductSuspensionResponse)

    check_history(client_sp, spgps.id)

    d = delete_service_providing_group_product_suspension.sync(
        client=client_fiso, id=cast(int, spgps.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    # RLS: SPGPS-SP002
    # they can still read history after deletion
    check_history(client_sp, spgps.id)


def test_spgps_so(data):
    (
        _,
        spg_id,
        (client_so, _),
        (client_other_so, _),
        _,
        (first_pt_id, common_pt_id, _),
    ) = data

    # RLS: SPGPS-SO001
    # SO can do everything on their own SPGPS

    s = create_service_providing_group_product_suspension.sync(
        client=client_so,
        body=ServiceProvidingGroupProductSuspensionCreateRequest(
            service_providing_group_id=spg_id,
            reason=ServiceProvidingGroupProductSuspensionReason.OTHER,
            product_type_ids=[common_pt_id],
        ),
    )
    assert isinstance(s, ServiceProvidingGroupProductSuspensionResponse)

    spgpss = list_service_providing_group_product_suspension.sync(client=client_so)
    assert isinstance(spgpss, list)
    assert len(spgpss) > 0

    spgps = read_service_providing_group_product_suspension.sync(
        client=client_so,
        id=cast(int, spgpss[0].id),
    )
    assert isinstance(spgps, ServiceProvidingGroupProductSuspensionResponse)

    # RLS: SPGPS-SO002
    check_history(client_so, s.id)

    u = update_service_providing_group_product_suspension.sync(
        client=client_so,
        id=cast(int, s.id),
        body=ServiceProvidingGroupProductSuspensionUpdateRequest(
            reason=ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGPS-SO003
    # the other SO can read since the common product type was suspended
    spgps = read_service_providing_group_product_suspension.sync(
        client=client_other_so,
        id=cast(int, s.id),
    )
    assert isinstance(spgps, ServiceProvidingGroupProductSuspensionResponse)

    # RLS: SPGPS-SO004
    check_history(client_other_so, s.id)

    # now delete suspension and check everyone can still see the history

    d = delete_service_providing_group_product_suspension.sync(
        client=client_so, id=cast(int, s.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    check_history(client_so, s.id)
    check_history(client_other_so, s.id)

    # now test with a product type only qualified by the first SO

    s = create_service_providing_group_product_suspension.sync(
        client=client_so,
        body=ServiceProvidingGroupProductSuspensionCreateRequest(
            service_providing_group_id=spg_id,
            reason=ServiceProvidingGroupProductSuspensionReason.OTHER,
            product_type_ids=[first_pt_id],
        ),
    )
    assert isinstance(s, ServiceProvidingGroupProductSuspensionResponse)

    # the other SO should not be able to read
    e = read_service_providing_group_product_suspension.sync(
        client=client_other_so,
        id=cast(int, s.id),
    )
    assert isinstance(e, ErrorMessage)
