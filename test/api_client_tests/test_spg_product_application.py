from security_token_service import (
    SecurityTokenService,
    TestEntityClient,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitUpdateRequest,
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
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
    Technology,
    DeviceType,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationResponse,
    ServiceProvidingGroupProductApplicationHistoryResponse,
    ServiceProvidingGroupProductApplicationUpdateRequest,
    ServiceProvidingGroupProductApplicationStatus,
    ServiceProvidingGroupProductApplicationRampingCapability,
    SpgpaApplicationDetailsFcrD,
    SpgpaApplicationDetailsFcrN,
    SpgpaApplicationDetailsMfrr,
    SpgpaAssessmentDetailsFcrD,
    SpgpaAssessmentDetailsFcrN,
    SpgpaRampingCapability,
    ErrorMessage,
    EmptyObject,
    ControllableUnitStatus,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
    update_controllable_unit,
)
from flex.api.technical_resource import create_technical_resource
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
    list_service_providing_group_product_application_history,
    read_service_providing_group_product_application_history,
)
from flex.api.service_providing_group_grid_prequalification import (
    list_service_providing_group_grid_prequalification,
)
from flex import AuthenticatedClient
import datetime
import pytest
from typing import cast


def mfrr_details(**kwargs):
    args = {
        "kind": "manual_frequency_restoration",
        "maximum_active_power_up": 3.5,
        "maximum_active_power_down": 3.5,
        "ramping_capability": SpgpaRampingCapability.ALWAYS,
        "ramping_description": "Units are connected one by one.",
    }
    args.update(kwargs)
    return SpgpaApplicationDetailsMfrr(**args)


def fcr_n_details(**kwargs):
    args = {
        "kind": "automatic_frequency_containment",
        "service_provider_contact_information": "Kari Nordmann, +47 000 00 000",
        "technical_contact_information": "Ola Nordmann, +47 000 00 000",
        "limited_energy_reservoir": True,
        "variable_production_consumption": False,
        "planned_prequalification_test_date": datetime.date(2026, 12, 1),
        "maximum_active_power_up": 1000,
        "maximum_active_power_down": 1000,
    }
    args.update(kwargs)
    return SpgpaApplicationDetailsFcrN(**args)


def fcr_d_details(**kwargs):
    args = {
        "kind": "automatic_frequency_containment_disturbance",
        "service_provider_contact_information": "Kari Nordmann, +47 000 00 000",
        "technical_contact_information": "Ola Nordmann, +47 000 00 000",
        "limited_energy_reservoir": False,
        "variable_production_consumption": True,
        "planned_prequalification_test_date": datetime.date(2026, 12, 1),
        "maximum_active_power_up": 800,
        "maximum_active_power_down": 600,
    }
    args.update(kwargs)
    return SpgpaApplicationDetailsFcrD(**args)


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(
        AuthenticatedClient,
        sts.get_client(TestEntityClient.TEST, "FISO"),
    )

    client_sp = cast(
        AuthenticatedClient,
        sts.fresh_client(TestEntityClient.TEST, "SP"),
    )
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_so = cast(
        AuthenticatedClient,
        sts.fresh_client(TestEntityClient.TEST, "SO"),
    )
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_other_so = cast(
        AuthenticatedClient,
        sts.fresh_client(TestEntityClient.COMMON, "SO"),
    )
    other_so_id = sts.get_userinfo(client_other_so)["party_id"]

    client_eu = cast(
        AuthenticatedClient,
        sts.get_client(TestEntityClient.TEST, "EU"),
    )
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # create 2 SPGs and activate them
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU",
            accounting_point_id=1002,
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
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    tr = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="New CU TR",
            controllable_unit_id=cast(int, cu.id),
            technology=[Technology.OTHER_CONSUMPTION],
            maximum_active_power=5.0,
            device_type=DeviceType.OTHER,
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

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-12",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    spg2 = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-13",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg2, ServiceProvidingGroupResponse)

    # SO cannot read the SPG yet (cf SPG RLS below)
    err = read_service_providing_group.sync(
        client=client_so,
        id=cast(int, spg.id),
    )
    assert isinstance(err, ErrorMessage)

    spgm_ids = []
    for spg_id in [spg.id, spg2.id]:
        spgm = create_service_providing_group_membership.sync(
            client=client_fiso,
            body=ServiceProvidingGroupMembershipCreateRequest(
                controllable_unit_id=cast(int, cu.id),
                service_providing_group_id=spg_id,
                valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
            ),
        )
        assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)
        spgm_ids.append(spgm.id)

        u = update_service_providing_group.sync(
            client=client_fiso,
            id=cast(int, spg_id),
            body=ServiceProvidingGroupUpdateRequest(
                status=ServiceProvidingGroupStatus.ACTIVE,
            ),
        )
        assert not isinstance(u, ErrorMessage)

    # apply for some product types for both SO and qualify the applications

    # 8 (mFRR), 6 (FCR-N) and 10 (FCR-D) have product-specific details, the
    # others have none. The first is used as the default product type
    pt_ids = [8, 5, 7, 6, 10]

    for clt, id in [(client_so, so_id), (client_other_so, other_so_id)]:
        for pt_id in pt_ids:
            sopt = create_system_operator_product_type.sync(
                client=clt,
                body=SystemOperatorProductTypeCreateRequest(
                    system_operator_id=id,
                    product_type_id=pt_id,
                ),
            )
            assert isinstance(sopt, SystemOperatorProductTypeResponse)

        sppa = create_service_provider_product_application.sync(
            client=client_sp,
            body=ServiceProviderProductApplicationCreateRequest(
                service_provider_id=sp_id,
                system_operator_id=id,
                product_type_ids=pt_ids,
            ),
        )
        assert isinstance(sppa, ServiceProviderProductApplicationResponse)

        u = update_service_provider_product_application.sync(
            client=clt,
            id=cast(int, sppa.id),
            body=ServiceProviderProductApplicationUpdateRequest(
                status=ServiceProviderProductApplicationStatus.QUALIFIED,
                qualified_at=datetime.datetime.fromisoformat(
                    "2024-01-01T00:00:00+01:00"
                ),
            ),
        )
        assert not isinstance(u, ErrorMessage)

    spg_ids = [spg.id, spg2.id]
    so_clients = [client_so, client_other_so]
    so_ids = [so_id, other_so_id]

    yield (sts, spg_ids, spgm_ids, client_sp, so_clients, so_ids, pt_ids)


# ---- ---- ---- ---- ----


# test FISO, SP and SO together because FISO and SO cannot create
# so we must get SP to do something before FISO and SO can do anything
def test_spgpa_fiso_sp_so(data):
    (sts, spg_ids, spgm_ids, client_sp, so_clients, so_ids, pt_ids) = data

    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")

    client_so = so_clients[0]
    so_id = so_ids[0]

    client_other_so = so_clients[1]
    other_so_id = so_ids[1]

    # no one but SP can create SPGPA
    spgpa = create_service_providing_group_product_application.sync(
        client=client_so,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(spgpa, ErrorMessage)

    # SP can create and read a SPGPA
    # RLS: SPGPA-SP001
    # endpoint: POST /service_providing_group_product_application
    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
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
    spg = read_service_providing_group.sync(client=client_so, id=spg_ids[0])
    assert isinstance(spg, ServiceProvidingGroupResponse)

    # create 2 other SPGPAs:

    # - one from the same SPG to the other SO
    spgpa2 = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=other_so_id,
            product_type_ids=[pt_ids[1]],
        ),
    )
    assert isinstance(spgpa2, ServiceProvidingGroupProductApplicationResponse)

    # - one from another SPG to the first SO
    spgpa3 = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[1],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[1]],
        ),
    )
    assert isinstance(spgpa3, ServiceProvidingGroupProductApplicationResponse)

    assert so_id != other_so_id

    # RLS: SPGPA-SO001

    # other SO can read the SPGPA targeted to them
    s = read_service_providing_group_product_application.sync(
        client=client_other_so,
        id=cast(int, spgpa2.id),
    )
    assert isinstance(s, ServiceProvidingGroupProductApplicationResponse)

    # since they have one application, they can also read applications from the
    # same SPG even if they are not targeted
    s = read_service_providing_group_product_application.sync(
        client=client_other_so,
        id=cast(int, spgpa.id),
    )
    assert isinstance(s, ServiceProvidingGroupProductApplicationResponse)

    # but they cannot read applications they have nothing to do with
    s = read_service_providing_group_product_application.sync(
        client=client_other_so,
        id=cast(int, spgpa3.id),
    )
    assert isinstance(s, ErrorMessage)

    # measure SPGGP count before any status transition
    # (trigger fires on leaving requested)
    spggps_before = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        service_providing_group_id=f"eq.{spg_ids[0]}",
    )
    assert isinstance(spggps_before, list)

    # SP cannot update when the resulting status would not be requested
    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # RLS: SPGPA-SO002
    # also they cannot update the ones they can read but that do not target them

    u = update_service_providing_group_product_application.sync(
        client=client_other_so,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
            prequalified_at=datetime.datetime.fromisoformat(
                "2024-01-01T00:00:00+01:00"
            ),
        ),
    )
    assert isinstance(u, ErrorMessage)

    # the first SO can however update since they are the target
    # endpoint: PATCH /service_providing_group_product_application/{id}
    u = update_service_providing_group_product_application.sync(
        client=client_so,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
            prequalified_at=datetime.datetime.fromisoformat(
                "2020-01-01T00:00:00+01:00"
            ),
            complete_at=datetime.datetime.fromisoformat("2020-01-01T00:00:00+01:00"),
        ),
    )
    assert not isinstance(u, ErrorMessage)

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
            application_details=mfrr_details(additional_information="test by FISO"),
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # the SO transition away from `requested` (above) triggered the
    # SPGGP sync, we need to verify the count increased by 2
    # One SPGGP is for the CSO and one is for the PSO.
    spggps_after = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        service_providing_group_id=f"eq.{spg_ids[0]}",
    )
    assert isinstance(spggps_after, list)
    assert len(spggps_after) == len(spggps_before) + 2

    # clearing prequalified_at so we can test SPGPA-VAL004/005
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
            prequalified_at=None,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGPA-SO003

    # spgpa2 targets the other SO, so that SO can read it through policy SO001
    # but Test SO cannot read it through this policy
    # if they can read it, it is therefore through policy SO003 with the created
    # SPGGP above

    s = read_service_providing_group_product_application.sync(
        client=client_so,
        id=cast(int, spgpa2.id),
    )
    assert isinstance(s, ServiceProvidingGroupProductApplicationResponse)

    # prequalified or verified, but no timestamp: not ok
    # cross-verification there:
    #   check on prequalified_at should be linked to prequalified status
    #   check on verified_at should be linked to verified status
    #   other combinations do not count

    # RLS: SPGPA-VAL004
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
            verified_at=datetime.datetime.fromisoformat(
                "2024-01-01T00:00:00+01:00"
            ),  # should not prevent the error
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
            prequalified_at=datetime.datetime.fromisoformat(
                "2024-01-01T00:00:00+01:00"
            ),
            verified_at=None,  # should not cause an error
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGPA-VAL005
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.VERIFIED
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.VERIFIED,
            verified_at=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
            prequalified_at=None,  # should not cause an error
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGPA-VAL006
    # rejected but timestamp: not ok
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.REJECTED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # same for other timestamp field

    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
            verified_at=None,
            prequalified_at=datetime.datetime.fromisoformat(
                "2024-01-01T00:00:00+01:00"
            ),
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.REJECTED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.REJECTED,
            prequalified_at=None,
            verified_at=None,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGPA-SP002
    # SP cannot update resource fields when status is not requested
    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            application_details=mfrr_details(maximum_active_power_up=2.0),
        ),
    )
    assert isinstance(u, ErrorMessage)

    # SP cannot update status to anything other than requested
    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.REQUESTED,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # just to trigger notification to SO
    for spgm_id in spgm_ids:
        d = delete_service_providing_group_membership.sync(
            client=client_fiso,
            id=cast(int, spgm_id),
            body=EmptyObject(),
        )
        assert not (isinstance(d, ErrorMessage))


# SPGPA-VAL009
def test_spgpa_product_type_ids_not_empty(data):
    (sts, spg_ids, _, client_sp, _, so_ids, pt_ids) = data

    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")
    so_id = so_ids[0]

    # insert with empty product_type_ids must fail
    e = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[],
        ),
    )
    assert isinstance(e, ErrorMessage)

    # but with a product type it's ok
    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    # update with empty product_type_ids must also fail
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            product_type_ids=[],
        ),
    )
    assert isinstance(u, ErrorMessage)


# SPGPA-VAL011
def test_spgpa_val011_complete_at_required(data):
    (sts, spg_ids, _, client_sp, so_clients, so_ids, pt_ids) = data

    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")
    so_id = so_ids[0]

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    assert spgpa.complete_at is None

    # trying to start prequalification without setting complete_at must fail
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # setting complete_at together with the status change is fine
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
            complete_at=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert u.complete_at is not None


# SPGPA-VAL010
def test_spgpa_no_duplicate_product_types(data):
    (sts, spg_ids, _, client_sp, _, so_ids, pt_ids) = data

    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")
    so_id = so_ids[0]

    # create a first application for spg[0] / so[0] with pt_ids[0]
    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    # creating a second application for the same SPG/SO with an overlapping
    # product type must fail
    e = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(e, ErrorMessage)

    # overlapping subset also fails
    e = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0], pt_ids[1]],
        ),
    )
    assert isinstance(e, ErrorMessage)

    # a non-overlapping product type for the same SPG/SO is fine
    spgpa2 = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[1]],
        ),
    )
    assert isinstance(spgpa2, ServiceProvidingGroupProductApplicationResponse)

    # updating SPGPA 2 to overlap with spgpa must also fail
    e = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa2.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            product_type_ids=[pt_ids[0]],
        ),
    )
    assert isinstance(e, ErrorMessage)

    # but updating it to a different non-overlapping product type is fine
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa2.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            product_type_ids=[pt_ids[2]],
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # same product type for a different SO is fine (no overlap)
    other_so_id = so_ids[1]
    spgpa3 = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=other_so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(spgpa3, ServiceProvidingGroupProductApplicationResponse)

    # same product type for a different SPG with the same SO is also fine
    spgpa4 = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[1],
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(spgpa4, ServiceProvidingGroupProductApplicationResponse)

    # updating SPGPA's own product_type_ids to the same value must not
    # raise a false duplicate
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            product_type_ids=[pt_ids[0]],
        ),
    )
    assert not isinstance(u, ErrorMessage)


def test_spgpa_history_read(data):
    (sts, _, _, _, _, _, _) = data

    for role in sts.SPG_ROLES:
        client = sts.get_client(TestEntityClient.TEST, role)

        spgpa_visible = list_service_providing_group_product_application.sync(
            client=client,
        )
        assert isinstance(spgpa_visible, list)

        # RLS: SPGPA-COM001
        # can read history on SPGPA they can read
        # only checking a few entries is sufficient
        for spgpa in spgpa_visible[:5]:
            # endpoint: GET /service_providing_group_product_application_history
            hist = list_service_providing_group_product_application_history.sync(
                client=client,
                service_providing_group_product_application_id=f"eq.{spgpa.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /service_providing_group_product_application_history/{id}
            hist_spgpa = read_service_providing_group_product_application_history.sync(
                client=client,
                id=cast(int, hist[0].id),
            )
            assert isinstance(
                hist_spgpa,
                ServiceProvidingGroupProductApplicationHistoryResponse,
            )


def test_no_read_access(data):
    (sts, _, _, _, _, _, _) = data

    for role in sts.NO_SPG_ROLES:
        spgpas = list_service_providing_group_product_application.sync(
            client=sts.get_client(TestEntityClient.TEST, role),
        )
        assert isinstance(spgpas, ErrorMessage)
        assert spgpas.code == "42501"


# RLS: SPGPA-SP002
def test_spgpa_sp_inactive(data):
    (sts, spg_ids, _, client_sp, so_clients, so_ids, pt_ids) = data

    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")
    client_so = so_clients[0]

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_ids[0],
            procuring_system_operator_id=so_ids[0],
            product_type_ids=[pt_ids[0]],
            application_details=mfrr_details(),
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    spgpa_id = cast(int, spgpa.id)

    def sp_set_status(status):
        return update_service_providing_group_product_application.sync(
            client=client_sp,
            id=spgpa_id,
            body=ServiceProvidingGroupProductApplicationUpdateRequest(status=status),
        )

    # SP can deactivate a requested application
    u = sp_set_status(ServiceProvidingGroupProductApplicationStatus.INACTIVE)
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert u.status == ServiceProvidingGroupProductApplicationStatus.INACTIVE

    # SP cannot do anything else from inactive than going back to requested
    u = sp_set_status(ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION)
    assert isinstance(u, ErrorMessage)
    u = sp_set_status(ServiceProvidingGroupProductApplicationStatus.INACTIVE)
    assert isinstance(u, ErrorMessage)
    u = update_service_providing_group_product_application.sync(
        client=client_sp,
        id=spgpa_id,
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            application_details=mfrr_details(maximum_active_power_up=2.0),
        ),
    )
    assert isinstance(u, ErrorMessage)

    # SP can put it back to requested
    u = sp_set_status(ServiceProvidingGroupProductApplicationStatus.REQUESTED)
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert u.status == ServiceProvidingGroupProductApplicationStatus.REQUESTED

    # SP cannot deactivate once the SO has started processing it
    u = update_service_providing_group_product_application.sync(
        client=client_so,
        id=spgpa_id,
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
            complete_at=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    u = sp_set_status(ServiceProvidingGroupProductApplicationStatus.INACTIVE)
    assert isinstance(u, ErrorMessage)

    # SO and FISO are not restricted by the SP rule
    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=spgpa_id,
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.INACTIVE,
        ),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    u = sp_set_status(ServiceProvidingGroupProductApplicationStatus.REQUESTED)
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)


def _create(client, spg_id, so_id, pt_ids, **kwargs):
    return create_service_providing_group_product_application.sync(
        client=client,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_id,
            procuring_system_operator_id=so_id,
            product_type_ids=pt_ids,
            **kwargs,
        ),
    )


def _update(client, spgpa_id, **kwargs):
    return update_service_providing_group_product_application.sync(
        client=client,
        id=spgpa_id,
        body=ServiceProvidingGroupProductApplicationUpdateRequest(**kwargs),
    )


# SPGPA-VAL012
def test_spgpa_val012_exactly_one_product_type(data):
    (_, spg_ids, _, client_sp, _, so_ids, pt_ids) = data
    mfrr, fcr_n = pt_ids[0], pt_ids[3]

    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [mfrr, fcr_n],
        application_details=mfrr_details(),
    )
    assert isinstance(e, ErrorMessage)
    assert "exactly one product type" in e.message

    # also on update
    spgpa = _create(
        client_sp, spg_ids[0], so_ids[0], [mfrr], application_details=mfrr_details()
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    u = _update(client_sp, cast(int, spgpa.id), product_type_ids=[mfrr, fcr_n])
    assert isinstance(u, ErrorMessage)
    assert "exactly one product type" in u.message


# SPGPA-VAL013
def test_spgpa_val013_application_details_kind_and_presence(data):
    (_, spg_ids, _, client_sp, _, so_ids, pt_ids) = data
    mfrr, no_variant, fcr_n = pt_ids[0], pt_ids[1], pt_ids[3]

    # required when the product type has an application variant
    e = _create(client_sp, spg_ids[0], so_ids[0], [mfrr])
    assert isinstance(e, ErrorMessage)
    assert "application_details is required" in e.message

    # the kind must be the product type
    e = _create(
        client_sp, spg_ids[0], so_ids[0], [fcr_n], application_details=mfrr_details()
    )
    assert isinstance(e, ErrorMessage)
    assert "application_details.kind must be automatic_frequency_containment" in (
        e.message
    )

    # not allowed when the product type has no application variant
    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [no_variant],
        application_details=mfrr_details(),
    )
    assert isinstance(e, ErrorMessage)
    assert "application_details is not allowed" in e.message

    # but then it is fine without
    spgpa = _create(client_sp, spg_ids[0], so_ids[0], [no_variant])
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    assert spgpa.application_details is None
    assert spgpa.assessment_details is None

    # the deprecated columns are only for mFRR
    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[1],
        [no_variant],
        maximum_active_power_up=1.0,
        maximum_active_power_down=1.0,
    )
    assert isinstance(e, ErrorMessage)
    assert "deprecated" in e.message


def test_spgpa_val013_application_details_fields(data):
    (_, spg_ids, _, client_sp, _, so_ids, pt_ids) = data
    mfrr, fcr_n, fcr_d = pt_ids[0], pt_ids[3], pt_ids[4]

    # out of range and wrong precision
    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [mfrr],
        application_details=mfrr_details(maximum_active_power_up=-1),
    )
    assert isinstance(e, ErrorMessage)
    assert "application_details.maximum_active_power_up must be at least 0" in (
        e.message
    )

    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [mfrr],
        application_details=mfrr_details(maximum_active_power_up=1.0005),
    )
    assert isinstance(e, ErrorMessage)
    assert "must be a multiple of 0.001" in e.message

    # string limits
    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [mfrr],
        application_details=mfrr_details(additional_information="x" * 513),
    )
    assert isinstance(e, ErrorMessage)
    assert "at most 512" in e.message

    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [mfrr],
        application_details=mfrr_details(ramping_description=""),
    )
    assert isinstance(e, ErrorMessage)
    assert "application_details.ramping_description" in e.message

    # all errors are reported at once
    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [fcr_d],
        application_details=fcr_d_details(
            maximum_active_power_up=-1, technical_contact_information=""
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert "maximum_active_power_up" in e.message
    assert "technical_contact_information" in e.message

    # FCR-N is symmetric, FCR-D is not
    e = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [fcr_n],
        application_details=fcr_n_details(maximum_active_power_down=900),
    )
    assert isinstance(e, ErrorMessage)
    assert (
        "maximum_active_power_up and application_details.maximum_active_power_down must be equal"
        in (e.message)
    )


def test_spgpa_val013_missing_and_unknown_fields(data):
    (_, spg_ids, _, client_sp, _, so_ids, pt_ids) = data
    fcr_n = pt_ids[3]

    # the typed client cannot send these, so the raw request is used
    def raw_create(application_details):
        return client_sp.get_httpx_client().post(
            "/service_providing_group_product_application",
            json={
                "service_providing_group_id": spg_ids[0],
                "procuring_system_operator_id": so_ids[0],
                "product_type_ids": [fcr_n],
                "application_details": application_details,
            },
        )

    valid = fcr_n_details().to_dict()
    valid["planned_prequalification_test_date"] = "2026-12-01"

    r = raw_create({**valid, "approved_maximum_active_power_up": 1})
    assert r.status_code == 400
    assert "approved_maximum_active_power_up" in r.json()["message"]

    r = raw_create({k: v for k, v in valid.items() if k != "limited_energy_reservoir"})
    assert r.status_code == 400
    assert "limited_energy_reservoir" in r.json()["message"]

    r = raw_create({**valid, "limited_energy_reservoir": "yes"})
    assert r.status_code == 400
    assert "limited_energy_reservoir" in r.json()["message"]

    r = raw_create({**valid, "planned_prequalification_test_date": "2026-02-31"})
    assert r.status_code == 400
    assert "2026-02-31" in r.json()["message"]

    r = raw_create({**valid, "maximum_active_power_up": "1000"})
    assert r.status_code == 400

    # other properties of the request are checked too
    r = client_sp.get_httpx_client().post(
        "/service_providing_group_product_application",
        json={
            "service_providing_group_id": spg_ids[0],
            "procuring_system_operator_id": so_ids[0],
            "product_type_ids": [fcr_n],
            "application_details": valid,
            "id": 1,
        },
    )
    assert r.status_code == 400

    r = raw_create(valid)
    assert r.status_code == 201


def test_spgpa_fcr_n(data):
    (sts, spg_ids, _, client_sp, so_clients, so_ids, pt_ids) = data
    fcr_n = pt_ids[3]
    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")

    spgpa = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [fcr_n],
        application_details=fcr_n_details(),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    assert isinstance(spgpa.application_details, SpgpaApplicationDetailsFcrN)
    assert spgpa.application_details.maximum_active_power_up == 1000
    assert spgpa.application_details.planned_prequalification_test_date == (
        datetime.date(2026, 12, 1)
    )
    assert spgpa.assessment_details is None
    # FCR is not mFRR: the deprecated columns stay empty
    assert spgpa.maximum_active_power_up is None
    assert spgpa.ramping_capability is None

    spgpa_id = cast(int, spgpa.id)

    # the SP cannot write the assessment
    u = _update(
        client_sp,
        spgpa_id,
        assessment_details=SpgpaAssessmentDetailsFcrN(
            kind="automatic_frequency_containment",
            approved_maximum_active_power_up=900,
            approved_maximum_active_power_down=900,
        ),
    )
    assert isinstance(u, ErrorMessage)

    # the SO can
    client_so = so_clients[0]
    u = _update(
        client_so,
        spgpa_id,
        assessment_details=SpgpaAssessmentDetailsFcrN(
            kind="automatic_frequency_containment",
            approved_maximum_active_power_up=900,
            approved_maximum_active_power_down=900,
        ),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert isinstance(u.assessment_details, SpgpaAssessmentDetailsFcrN)
    assert u.assessment_details.approved_maximum_active_power_up == 900
    assert isinstance(u.application_details, SpgpaApplicationDetailsFcrN)

    # the SO cannot write the application details
    u = _update(client_so, spgpa_id, application_details=fcr_n_details())
    assert isinstance(u, ErrorMessage)

    # the kind of the assessment must be the one of the product type
    u = _update(
        client_so,
        spgpa_id,
        assessment_details=SpgpaAssessmentDetailsFcrD(
            kind="automatic_frequency_containment_disturbance",
            approved_maximum_active_power_up=700,
            approved_maximum_active_power_down=500,
        ),
    )
    assert isinstance(u, ErrorMessage)
    assert "assessment_details.kind must be automatic_frequency_containment" in (
        u.message
    )

    # FCR-N assessment is symmetric too
    u = _update(
        client_so,
        spgpa_id,
        assessment_details=SpgpaAssessmentDetailsFcrN(
            kind="automatic_frequency_containment",
            approved_maximum_active_power_up=900,
            approved_maximum_active_power_down=800,
        ),
    )
    assert isinstance(u, ErrorMessage)
    assert "must be equal" in u.message

    # an unrelated update does not touch the details
    u = _update(
        client_fiso,
        spgpa_id,
        status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
        complete_at=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert isinstance(u.application_details, SpgpaApplicationDetailsFcrN)
    assert isinstance(u.assessment_details, SpgpaAssessmentDetailsFcrN)


def test_spgpa_fcr_d(data):
    (_, spg_ids, _, client_sp, so_clients, so_ids, pt_ids) = data
    fcr_d = pt_ids[4]

    spgpa = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [fcr_d],
        application_details=fcr_d_details(),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    assert isinstance(spgpa.application_details, SpgpaApplicationDetailsFcrD)
    # up and down can differ for FCR-D
    assert spgpa.application_details.maximum_active_power_up == 800
    assert spgpa.application_details.maximum_active_power_down == 600

    u = _update(
        so_clients[0],
        cast(int, spgpa.id),
        assessment_details=SpgpaAssessmentDetailsFcrD(
            kind="automatic_frequency_containment_disturbance",
            approved_maximum_active_power_up=700,
            approved_maximum_active_power_down=500,
        ),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert isinstance(u.assessment_details, SpgpaAssessmentDetailsFcrD)
    assert u.assessment_details.approved_maximum_active_power_down == 500


def test_spgpa_mfrr_has_no_assessment(data):
    (_, spg_ids, _, client_sp, so_clients, so_ids, pt_ids) = data

    spgpa = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [pt_ids[0]],
        application_details=mfrr_details(additional_information="Weekdays only."),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    assert isinstance(spgpa.application_details, SpgpaApplicationDetailsMfrr)
    assert spgpa.assessment_details is None

    u = _update(
        so_clients[0],
        cast(int, spgpa.id),
        assessment_details=SpgpaAssessmentDetailsFcrN(
            kind="automatic_frequency_containment",
            approved_maximum_active_power_up=1,
            approved_maximum_active_power_down=1,
        ),
    )
    assert isinstance(u, ErrorMessage)
    assert "assessment_details" in u.message


# transition period: the deprecated mFRR columns are kept in sync
def test_spgpa_mfrr_legacy_columns_sync(data):
    (sts, spg_ids, _, client_sp, _, so_ids, pt_ids) = data
    mfrr = pt_ids[0]
    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")

    # details are copied to the deprecated columns
    spgpa = _create(
        client_sp,
        spg_ids[0],
        so_ids[0],
        [mfrr],
        application_details=mfrr_details(
            maximum_active_power_up=2.5, additional_information="Info"
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)
    assert spgpa.maximum_active_power_up == 2.5
    assert spgpa.maximum_active_power_down == 3.5
    assert spgpa.ramping_capability == "always"
    assert spgpa.additional_information == "Info"

    # the deprecated columns are copied to the details
    spgpa2 = _create(
        client_sp,
        spg_ids[1],
        so_ids[0],
        [mfrr],
        maximum_active_power_up=1.5,
        maximum_active_power_down=1.5,
        ramping_capability=ServiceProvidingGroupProductApplicationRampingCapability.NEVER,
        ramping_description="No ramping",
    )
    assert isinstance(spgpa2, ServiceProvidingGroupProductApplicationResponse)
    details = spgpa2.application_details
    assert isinstance(details, SpgpaApplicationDetailsMfrr)
    assert details.kind == "manual_frequency_restoration"
    assert details.maximum_active_power_up == 1.5
    assert details.ramping_capability == SpgpaRampingCapability.NEVER
    assert details.ramping_description == "No ramping"

    # updates go both ways
    u = _update(client_sp, cast(int, spgpa2.id), maximum_active_power_up=2.0)
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert isinstance(u.application_details, SpgpaApplicationDetailsMfrr)
    assert u.application_details.maximum_active_power_up == 2.0
    assert u.application_details.maximum_active_power_down == 1.5

    u = _update(
        client_sp,
        cast(int, spgpa2.id),
        application_details=mfrr_details(
            maximum_active_power_up=4.0, maximum_active_power_down=5.0
        ),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)
    assert u.maximum_active_power_up == 4.0
    assert u.maximum_active_power_down == 5.0

    # both at once is fine when they agree, and a conflict when they do not
    u = _update(
        client_fiso,
        cast(int, spgpa2.id),
        maximum_active_power_up=6.0,
        application_details=mfrr_details(
            maximum_active_power_up=6.0, maximum_active_power_down=5.0
        ),
    )
    assert isinstance(u, ServiceProvidingGroupProductApplicationResponse)

    u = _update(
        client_fiso,
        cast(int, spgpa2.id),
        maximum_active_power_up=7.0,
        application_details=mfrr_details(
            maximum_active_power_up=8.0, maximum_active_power_down=5.0
        ),
    )
    assert isinstance(u, ErrorMessage)
    assert "conflict" in u.message
