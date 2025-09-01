from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitLookupRequest,
    ControllableUnitCreateRequest,
    ControllableUnitLookupResponse,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    EntityResponse,
    ErrorMessage,
)
from flex.api.controllable_unit import (
    read_controllable_unit,
    create_controllable_unit,
    call_controllable_unit_lookup,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.entity import (
    read_entity,
)
from typing import cast
import pytest
from datetime import date, datetime, timedelta, time, timezone


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_cu_lookup_params(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    eu_entity = read_entity.sync(
        client=client_fiso,
        id=sts.get_userinfo(sts.get_client(TestEntity.TEST))["entity_id"],
    )
    assert isinstance(eu_entity, EntityResponse)

    other_eu_entity = read_entity.sync(
        client=client_fiso,
        id=sts.get_userinfo(sts.get_client(TestEntity.COMMON))["entity_id"],
    )
    assert isinstance(other_eu_entity, EntityResponse)

    # ill formed requests

    # no AP/CU
    # endpoint: POST /controllable_unit/lookup
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # bad EU business ID
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user="badformat",
            accounting_point="133700000000010007",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # bad AP business ID
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="badformat",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # bad CU business ID
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            controllable_unit="badformat",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-LOOKUP",
            accounting_point_id=1001,  # technical ID of AP 133700000000010007
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    # too much data
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="133700000000010007",
            controllable_unit=cu.business_id,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # lookup by CU

    # CU does not exist
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            controllable_unit="00000000-0000-4000-8000-000000000000",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP404"

    # CU exists but does not match with end user
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(other_eu_entity.business_id),
            controllable_unit=cu.business_id,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP403"

    # success (1 CU)
    cul = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            controllable_unit=cu.business_id,
        ),
    )
    assert isinstance(cul, ControllableUnitLookupResponse)
    assert len(cul.controllable_units) == 1

    # lookup by AP

    # AP does not exist
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="999999999999999999",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP404"

    # AP exists but does not match with end user
    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(other_eu_entity.business_id),
            accounting_point="133700000000010007",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP403"

    # success on an AP with no CU
    cul = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="133700000000010991",
        ),
    )
    assert isinstance(cul, ControllableUnitLookupResponse)
    assert len(cul.controllable_units) == 0

    # success on an AP with some CUs
    cul = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="133700000000010007",
        ),
    )
    assert isinstance(cul, ControllableUnitLookupResponse)
    assert len(cul.controllable_units) >= 1
    nb_cu_lookup = len(cul.controllable_units)

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-LOOKUP 2",
            accounting_point_id=1001,  # technical ID of AP 133700000000010007
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    # check lookup catches the newly created one as well
    cul = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="133700000000010007",
        ),
    )
    assert isinstance(cul, ControllableUnitLookupResponse)
    assert len(cul.controllable_units) == nb_cu_lookup + 1


def test_cu_lookup_flow(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    eu_entity = read_entity.sync(
        client=client_fiso,
        id=sts.get_userinfo(sts.get_client(TestEntity.TEST))["entity_id"],
    )
    assert isinstance(eu_entity, EntityResponse)

    # create a CU and check SP cannot see it but they can lookup

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-LOOKUP",
            accounting_point_id=1001,  # technical ID of AP 133700000000010007
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    client_sp = sts.get_client(TestEntity.TEST, "SP")

    e = read_controllable_unit.sync(
        client=client_sp,
        id=cast(int, cu.id),
    )
    assert isinstance(e, ErrorMessage)

    cul = call_controllable_unit_lookup.sync(
        client=client_sp,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            controllable_unit=cu.business_id,
        ),
    )
    assert isinstance(cul, ControllableUnitLookupResponse)
    assert len(cul.controllable_units) == 1
    assert cul.controllable_units[0].id == cu.id

    # and create a contract

    def midnight_n_days_diff(n):
        return (
            datetime.combine(date.today() + timedelta(days=n), time.min)
            .astimezone(tz=timezone.utc)
            .isoformat()
        )

    sp_id = sts.get_userinfo(client_sp)["party_id"]

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_sp,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cul.controllable_units[0].id,
            service_provider_id=sp_id,
            end_user_id=11,
            contract_reference="TEST-CONTRACT",
            valid_from=midnight_n_days_diff(20),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)
