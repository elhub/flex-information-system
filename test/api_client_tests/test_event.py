from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ErrorMessage,
    EventResponse,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ControllableUnitLookupRequest,
    ControllableUnitLookupResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationResponse,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplicationCommentCreateRequest,
    ServiceProviderProductApplicationCommentVisibility,
    ServiceProviderProductApplicationCommentResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationResponse,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationResponse,
)
from flex.api.event import (
    list_event,
    read_event,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
    call_controllable_unit_lookup,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.technical_resource import (
    create_technical_resource,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)
from flex.api.service_provider_product_application_comment import (
    create_service_provider_product_application_comment,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    update_service_providing_group,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.service_providing_group_grid_prequalification import (
    create_service_providing_group_grid_prequalification,
)
from flex.api.service_providing_group_product_application import (
    create_service_providing_group_product_application,
)
from typing import cast

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_event_eu(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_eu = sts.get_client(TestEntity.TEST, "EU")

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="EVENT-TEST-CU-1",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    sp_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "SP"))["party_id"]
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    cusp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="EVENT-TEST-CONTRACT",
            valid_from="2020-01-01T00:00:00+1",
            valid_to=None,
        ),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    tr = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="EVENT TR",
            controllable_unit_id=cast(int, cu.id),
        ),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    def check(client):
        # endpoint: GET /event
        events = list_event.sync(client=client, limit="10000")
        assert isinstance(events, list)

        # RLS: EVENT-EU001
        # EU can see creation event for the CU
        cu_event = [
            e
            for e in events
            if e.type == "no.elhub.flex.controllable_unit.create"
            and e.source == f"/controllable_unit/{cu.id}"
        ]

        # RLS: EVENT-EU002
        # EU can see creation event for the CUSP
        cusp_event = [
            e
            for e in events
            if e.type == "no.elhub.flex.controllable_unit_service_provider.create"
            and e.source == f"/controllable_unit_service_provider/{cusp.id}"
        ]

        # RLS: EVENT-EU003
        # EU can see creation event for the TR
        tr_event = [
            e
            for e in events
            if e.type == "no.elhub.flex.technical_resource.create"
            and e.source == f"/technical_resource/{tr.id}"
        ]

        return (len(cu_event), len(cusp_event), len(tr_event))

    # works for the EU on the AP
    assert check(client_eu) == (1, 1, 1)

    # does not work for the other EU
    client_other_eu = sts.get_client(TestEntity.COMMON, "EU")
    assert check(client_other_eu) == (0, 0, 0)


# RLS: EVENT-FISO001
# RLS: EVENT-SO001
def test_event_fiso_so(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    def check(client):
        events = list_event.sync(client=client, limit="10000")
        assert isinstance(events, list)

        # test some of the resources
        for resource in (
            "controllable_unit",
            "technical_resource",
            "service_provider_product_application_comment",
            "service_providing_group_grid_prequalification",
        ):
            # only test one type of operation, as we don't filter by operation
            # in the policies
            assert any(e.type == f"no.elhub.flex.{resource}.create" for e in events)

    check(client_fiso)
    check(client_so)


def test_event_sp(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "SP"))["party_id"]

    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="EVENT-TEST-CU-1",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    tr = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="EVENT TR",
            controllable_unit_id=cast(int, cu.id),
        ),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    events = list_event.sync(client=client_sp, limit="10000")
    assert isinstance(events, list)

    # RLS: EVENT-SP001
    # RLS: EVENT-SP002
    # SP cannot see CU/TR creation event before being SP
    assert not any(
        e
        for e in events
        if (
            e.type == "no.elhub.flex.controllable_unit.create"
            and e.source == f"/controllable_unit/{cu.id}"
        )
        or (
            e.type == "no.elhub.flex.technical_resource.create"
            and e.source == f"/technical_resource/{tr.id}"
        )
    )

    cusp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=11,
            contract_reference="EVENT-TEST-CONTRACT",
            valid_from="2020-01-01T00:00:00+1",
            valid_to=None,
        ),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    lookup = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user="13370000001",  # Test EU entity business ID
            accounting_point="133700000000010014",  # test AP 1002
        ),
    )
    assert isinstance(lookup, ControllableUnitLookupResponse)

    sopt = create_system_operator_product_type.sync(
        client=client_fiso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=1,
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[1],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_fiso,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2023-01-01T00:00:00+1",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    sppac_hidden = create_service_provider_product_application_comment.sync(
        client=client_fiso,
        body=ServiceProviderProductApplicationCommentCreateRequest(
            service_provider_product_application_id=cast(int, sppa.id),
            content="Private comment",
            visibility=ServiceProviderProductApplicationCommentVisibility.SAME_PARTY,
        ),
    )
    assert isinstance(sppac_hidden, ServiceProviderProductApplicationCommentResponse)

    sppac_public = create_service_provider_product_application_comment.sync(
        client=client_fiso,
        body=ServiceProviderProductApplicationCommentCreateRequest(
            service_provider_product_application_id=cast(int, sppa.id),
            content="Public comment",
            visibility=ServiceProviderProductApplicationCommentVisibility.ANY_PARTY,
        ),
    )
    assert isinstance(sppac_public, ServiceProviderProductApplicationCommentResponse)

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="EVENT-TEST-SPG-1",
            service_provider_id=sp_id,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2023-01-01T00:00:00+1",
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

    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=cast(int, spg.id),
            impacted_system_operator_id=so_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=cast(int, spg.id),
            procuring_system_operator_id=so_id,
            product_type_id=1,
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    events = list_event.sync(client=client_sp, limit="10000")
    assert isinstance(events, list)
    assert len(events) > 0

    # endpoint: GET /event/{id}
    e = read_event.sync(client=client_sp, id=cast(int, events[0].id))
    assert isinstance(e, EventResponse)

    client_other_sp = sts.get_client(TestEntity.COMMON, "SP")
    events_other = list_event.sync(client=client_other_sp, limit="10000")
    assert isinstance(events_other, list)

    # now SP can see CU/TR creation events
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.controllable_unit.create"
        and e.source == f"/controllable_unit/{cu.id}"
    )
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.technical_resource.create"
        and e.source == f"/technical_resource/{tr.id}"
    )

    # but never lookup
    assert not any(
        e for e in events if e.type == "no.elhub.flex.controllable_unit.lookup"
    )

    # RLS: EVENT-SP003
    # SP can see CUSP events when they are SP
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.controllable_unit_service_provider.create"
        and e.source == f"/controllable_unit_service_provider/{cusp.id}"
    )

    # RLS: EVENT-SP004
    # same for SPPA
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.service_provider_product_application.create"
        and e.source == f"/service_provider_product_application/{sppa.id}"
    )

    # RLS: EVENT-SP005
    # same for comments but only if they have the right visibility
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.service_provider_product_application_comment.create"
        and e.source
        == f"/service_provider_product_application_comment/{sppac_public.id}"
    )
    assert not any(
        e
        for e in events
        if e.type == "no.elhub.flex.service_provider_product_application_comment.create"
        and e.source
        == f"/service_provider_product_application_comment/{sppac_hidden.id}"
    )

    # RLS: EVENT-SP006
    # same for SPG
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.service_providing_group.create"
        and e.source == f"/service_providing_group/{spg.id}"
    )

    # RLS: EVENT-SP007
    # SP can see SPGM when they are SP on the SPG
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.service_providing_group_membership.create"
        and e.source == f"/service_providing_group_membership/{spgm.id}"
    )

    # RLS: EVENT-SP008
    # same for SPGGP
    assert any(
        e
        for e in events
        if e.type
        == "no.elhub.flex.service_providing_group_grid_prequalification.create"
        and e.source == f"/service_providing_group_grid_prequalification/{spggp.id}"
    )

    # RLS: EVENT-SP009
    # same for SPGPA
    assert any(
        e
        for e in events
        if e.type == "no.elhub.flex.service_providing_group_product_application.create"
        and e.source == f"/service_providing_group_product_application/{spgpa.id}"
    )

    # other SP cannot see stuff related to the first SP
    assert not any(
        e
        for e in events_other
        if e.type == "no.elhub.flex.controllable_unit_service_provider.create"
        and e.source == f"/controllable_unit_service_provider/{cusp.id}"
    )
    assert not any(
        e
        for e in events_other
        if e.type == "no.elhub.flex.service_provider_product_application.create"
        and e.source == f"/service_provider_product_application/{sppa.id}"
    )
    assert not any(
        e
        for e in events_other
        if e.type == "no.elhub.flex.service_provider_product_application_comment.create"
        and e.source
        == f"/service_provider_product_application_comment/{sppac_public.id}"
    )
    assert not any(
        e
        for e in events_other
        if e.type == "no.elhub.flex.service_provider_product_application_comment.create"
        and e.source
        == f"/service_provider_product_application_comment/{sppac_hidden.id}"
    )
    assert not any(
        e
        for e in events_other
        if e.type == "no.elhub.flex.service_providing_group.create"
        and e.source == f"/service_providing_group/{spg.id}"
    )
    assert not any(
        e
        for e in events_other
        if e.type == "no.elhub.flex.service_providing_group_membership.create"
        and e.source == f"/service_providing_group_membership/{spgm.id}"
    )
    assert not any(
        e
        for e in events_other
        if e.type
        == "no.elhub.flex.service_providing_group_grid_prequalification.create"
        and e.source == f"/service_providing_group_grid_prequalification/{spggp.id}"
    )
    assert not any(
        e
        for e in events_other
        if e.type == "no.elhub.flex.service_providing_group_product_application.create"
        and e.source == f"/service_providing_group_product_application/{spgpa.id}"
    )


def test_event_anon(sts):
    client = sts.get_client()

    events = list_event.sync(client=client)
    assert isinstance(events, ErrorMessage)


def test_event_ent(sts):
    client_ent = sts.get_client(TestEntity.TEST)

    events = list_event.sync(client=client_ent)
    assert isinstance(events, ErrorMessage)
