from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitLookupRequest,
    ControllableUnitCreateRequest,
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


def test_cu_lookup(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    eu_entity = read_entity.sync(
        client=client_fiso,
        id=sts.get_userinfo(sts.get_client(TestEntity.TEST))["entity_id"],
    )
    assert isinstance(eu_entity, EntityResponse)

    # various cases of ill formed request / CU not found

    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="12359120doesnotexist",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP404"

    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            controllable_unit="12359120doesnotexist",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP404"

    e = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="12359120doesnotexist",
            controllable_unit="12359120doesnotexist",
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP404"

    # now works

    cul = call_controllable_unit_lookup.sync(
        client=client_fiso,
        body=ControllableUnitLookupRequest(
            end_user=str(eu_entity.business_id),
            accounting_point="133700000000010007",
        ),
    )
    assert isinstance(cul, list)
    assert len(cul) >= 1

    # create a CU and check SP cannot see it but they can lookup

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-LOOKUP",
            accounting_point_id="133700000000010007",
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
    assert isinstance(cul, list)
    assert len(cul) == 1
    assert cul[0].id == cu.id

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
            controllable_unit_id=cul[0].id,
            service_provider_id=sp_id,
            contract_reference="TEST-CONTRACT",
            valid_from=midnight_n_days_diff(20),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)
