# type: ignore[union-attr]
from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AccountingPointGridLocationCreateRequest,
    AccountingPointGridLocationObjectType,
    AccountingPointGridLocationQuality,
    AccountingPointGridLocationResponse,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    DeviceType,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupPowerPerSubstationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
    Technology,
)
from flex.api.accounting_point_grid_location import (
    create_accounting_point_grid_location,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    list_service_providing_group,
)
from flex.api.service_providing_group_power_per_substation import (
    read_service_providing_group_power_per_substation,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.controllable_unit import create_controllable_unit
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.technical_resource import create_technical_resource

import pytest
import datetime
from typing import cast


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_service_providing_group_power_per_substation_aggregation(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_eu = sts.get_client(TestEntity.TEST, "EU")
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # test case:
    # - 5 CUs in one SPG across 4 APs
    # - AP 1001 has 2 CUs, while AP 1004 won't have a grid location
    # - each CU has one TR: CU1 has MAP = 10, CU2 has MAP = 20, etc
    # - 2 APs will have the same substation, so that CUs 1, 2, 3 end up in the
    #   same substation row in the per-substation aggregates

    # create SPG

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="SPGPPS-TEST-AGGREGATION",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    # at this point the substations list should be empty
    pps = read_service_providing_group_power_per_substation.sync(
        client=client_fiso, id=spg.id
    )
    assert isinstance(pps, ServiceProvidingGroupPowerPerSubstationResponse)
    assert pps.substations == []

    # create CUs

    cu1 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="SPGPPS-CU1",
            accounting_point_id=1001,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu1, ControllableUnitResponse)

    cu2 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="SPGPPS-CU2",
            accounting_point_id=1001,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu2, ControllableUnitResponse)

    cu3 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="SPGPPS-CU3",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu3, ControllableUnitResponse)

    cu4 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="SPGPPS-CU4",
            accounting_point_id=1003,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu4, ControllableUnitResponse)

    cu5 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="SPGPPS-CU5",
            accounting_point_id=1004,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu5, ControllableUnitResponse)

    # create TRs

    tr1 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGPPS-TR1",
            controllable_unit_id=cu1.id,
            technology=[Technology.SOLAR],
            maximum_active_power=10.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr1, TechnicalResourceResponse)

    tr2 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGPPS-TR2",
            controllable_unit_id=cu2.id,
            technology=[Technology.SOLAR],
            maximum_active_power=20.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr2, TechnicalResourceResponse)

    tr3 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGPPS-TR3",
            controllable_unit_id=cu3.id,
            technology=[Technology.SOLAR],
            maximum_active_power=30.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr3, TechnicalResourceResponse)

    tr4 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGPPS-TR4",
            controllable_unit_id=cu4.id,
            technology=[Technology.BATTERY],
            maximum_active_power=40.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr4, TechnicalResourceResponse)

    tr5 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGPPS-TR5",
            controllable_unit_id=cu5.id,
            technology=[Technology.BATTERY],
            maximum_active_power=50.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr5, TechnicalResourceResponse)

    # assign CUs to SP and put them in the SPG

    for cu in [cu1, cu2, cu3, cu4, cu5]:
        cusp = create_controllable_unit_service_provider.sync(
            client=client_fiso,
            body=ControllableUnitServiceProviderCreateRequest(
                controllable_unit_id=cu.id,
                service_provider_id=sp_id,
                end_user_id=eu_id,
                contract_reference="TEST-CONTRACT",
                valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
                valid_to=None,
            ),
        )
        assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    for cu in [cu1, cu2, cu3, cu4, cu5]:
        m = create_service_providing_group_membership.sync(
            client=client_fiso,
            body=ServiceProvidingGroupMembershipCreateRequest(
                controllable_unit_id=cu.id,
                service_providing_group_id=cast(int, spg.id),
                valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
            ),
        )
        assert isinstance(m, ServiceProvidingGroupMembershipResponse)

    # without any grid locations everything falls into the null substation row
    pps = read_service_providing_group_power_per_substation.sync(
        client=client_fiso, id=spg.id
    )
    assert isinstance(pps, ServiceProvidingGroupPowerPerSubstationResponse)
    assert len(pps.substations) == 1
    null_row = pps.substations[0]
    assert null_row.substation_business_id is None
    assert null_row.substation_name is None
    assert null_row.controllable_unit.count == 5

    # set grid location on APs

    sub_a_business_id = "b1000001-0000-4000-8000-000000000011"
    sub_b_business_id = "b1000001-0000-4000-8000-000000000012"

    apgl1 = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=AccountingPointGridLocationCreateRequest(
            accounting_point_id=1001,
            object_type=AccountingPointGridLocationObjectType.SUBSTATION,
            business_id=sub_a_business_id,
            name="Bor 132 kV",
            nominal_voltage=132.0,
            quality=AccountingPointGridLocationQuality.CONFIRMED,
        ),
    )
    assert isinstance(apgl1, AccountingPointGridLocationResponse)

    # same substation as previous AP
    apgl2 = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=AccountingPointGridLocationCreateRequest(
            accounting_point_id=1002,
            object_type=AccountingPointGridLocationObjectType.SUBSTATION,
            business_id=sub_a_business_id,
            name="Bor 132 kV",
            nominal_voltage=132.0,
            quality=AccountingPointGridLocationQuality.CONFIRMED,
        ),
    )
    assert isinstance(apgl2, AccountingPointGridLocationResponse)

    apgl3 = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=AccountingPointGridLocationCreateRequest(
            accounting_point_id=1003,
            object_type=AccountingPointGridLocationObjectType.SUBSTATION,
            business_id=sub_b_business_id,
            name="Sol transformatorstasjon",
            nominal_voltage=66.0,
            quality=AccountingPointGridLocationQuality.CONFIRMED,
        ),
    )
    assert isinstance(apgl3, AccountingPointGridLocationResponse)

    # AP 1004 intentionally left without a grid location

    # query the per-substation breakdown again

    pps = read_service_providing_group_power_per_substation.sync(
        client=client_fiso, id=spg.id
    )
    assert isinstance(pps, ServiceProvidingGroupPowerPerSubstationResponse)

    # should have exactly 3 rows: substation A, substation B, and null
    assert len(pps.substations) == 3
    by_sub = {row.substation_business_id: row for row in pps.substations}
    assert set(by_sub.keys()) == {
        sub_a_business_id,
        sub_b_business_id,
        None,
    }

    # substation A: CU1 + CU2 + CU3 (TR: 10, 20, 30)
    sub_a = by_sub[sub_a_business_id]
    assert sub_a.substation_name == "Bor 132 kV"
    assert sub_a.controllable_unit.count == 3
    assert sub_a.controllable_unit.maximum_active_power.sum_ == pytest.approx(60.0)
    assert sub_a.controllable_unit.maximum_active_power.average == pytest.approx(20.0)
    assert sub_a.controllable_unit.maximum_active_power.min_ == pytest.approx(10.0)
    assert sub_a.controllable_unit.maximum_active_power.max_ == pytest.approx(30.0)

    # substation B: CU4 (TR: 40)
    sub_b = by_sub[sub_b_business_id]
    assert sub_b.substation_name == "Sol transformatorstasjon"
    assert sub_b.controllable_unit.count == 1
    assert sub_b.controllable_unit.maximum_active_power.sum_ == pytest.approx(40.0)
    assert sub_b.controllable_unit.maximum_active_power.average == pytest.approx(40.0)
    assert sub_b.controllable_unit.maximum_active_power.min_ == pytest.approx(40.0)
    assert sub_b.controllable_unit.maximum_active_power.max_ == pytest.approx(40.0)

    # null substation: CU5 (TR: 50)
    null_sub = by_sub[None]
    assert null_sub.substation_name is None
    assert null_sub.controllable_unit.count == 1
    assert null_sub.controllable_unit.maximum_active_power.sum_ == pytest.approx(50.0)
    assert null_sub.controllable_unit.maximum_active_power.average == pytest.approx(
        50.0
    )
    assert null_sub.controllable_unit.maximum_active_power.min_ == pytest.approx(50.0)
    assert null_sub.controllable_unit.maximum_active_power.max_ == pytest.approx(50.0)


# RLS: SPGPPS-COM001
def test_service_providing_group_power_per_substation_common(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_sp = sts.get_client(TestEntity.TEST, "SP")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    for client in [client_fiso, client_sp, client_so]:
        spgs = list_service_providing_group.sync(client=client)
        assert isinstance(spgs, list)
        assert len(spgs) > 0

        pps = read_service_providing_group_power_per_substation.sync(
            client=client, id=spgs[0].id
        )
        assert isinstance(pps, ServiceProvidingGroupPowerPerSubstationResponse)
        assert isinstance(pps.substations, list)
