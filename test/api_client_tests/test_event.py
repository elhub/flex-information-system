from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ErrorMessage,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
)
from flex.api.event import (
    list_event,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.technical_resource import (
    create_technical_resource,
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
def test_event_fiso(sts):
    # client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    pass


# RLS: EVENT-SO001
# CU/CUSP/TR/SOPT/SPPA/SPPAC/SPG/SPGM/SPGGP/SPGPA
# not
def test_event_so(sts):
    # client_so = sts.get_client(TestEntity.TEST, "SO")
    pass


# RLS: EVENT-SP001
# CU no lookup, when CUSP
# RLS: EVENT-SP002
# TR when CUSP
# RLS: EVENT-SP003
# CUSP them
# RLS: EVENT-SP004
# SPPA them
# RLS: EVENT-SP005
# comments SPPA them visibility
# RLS: EVENT-SP006
# SPG them
# RLS: EVENT-SP007
# SPGM when SPG them
# RLS: EVENT-SP008
# SPGGP when SPG them
# RLS: EVENT-SP009
# SPGPA when SPG them
def test_event_sp(sts):
    pass


def test_event_anon(sts):
    client = sts.get_client()

    events = list_event.sync(client=client)
    assert isinstance(events, ErrorMessage)
    assert events.message.startswith("permission denied")


def test_event_ent(sts):
    client_ent = sts.get_client(TestEntity.TEST)

    events = list_event.sync(client=client_ent)
    assert isinstance(events, ErrorMessage)
    assert events.message.startswith("permission denied")
