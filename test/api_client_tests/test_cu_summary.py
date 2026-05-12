# type: ignore[union-attr]
from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitSummaryResponse,
    DeviceType,
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
    Technology,
)
from flex.api.controllable_unit import create_controllable_unit, list_controllable_unit
from flex.api.controllable_unit_summary import read_controllable_unit_summary
from flex.api.technical_resource import create_technical_resource

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: CUSU-COM001
def test_controllable_unit_summary_common(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_sp = sts.get_client(TestEntity.TEST, "SP")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    for client in [client_fiso, client_sp, client_so]:
        cus = list_controllable_unit.sync(client=client)
        assert isinstance(cus, list)
        assert len(cus) > 0

        cusu = read_controllable_unit_summary.sync(client=client, id=cus[0].id)
        assert isinstance(cusu, ControllableUnitSummaryResponse)


# test that aggregation values are correctly computed
def test_controllable_unit_summary_aggregation(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # create a CU with no TR and check the summary exists but with zeros

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CUSU-TEST-AGGREGATION",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    summary = read_controllable_unit_summary.sync(client=client_fiso, id=cu.id)
    assert isinstance(summary, ControllableUnitSummaryResponse)

    agg = summary.technical_resource
    assert agg.count == 0
    assert agg.maximum_active_power.sum_ == pytest.approx(0.0)
    assert agg.maximum_active_power.average == pytest.approx(0.0)
    assert agg.by_technology.additional_properties == {}

    # add some TRs and check the summary values are correct

    tr1 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="CUSU-TR-SOLAR-1",
            controllable_unit_id=cu.id,
            technology=[Technology.SOLAR],
            maximum_active_power=10.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr1, TechnicalResourceResponse)

    tr2 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="CUSU-TR-SOLAR-2",
            controllable_unit_id=cu.id,
            technology=[Technology.SOLAR],
            maximum_active_power=20.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr2, TechnicalResourceResponse)

    tr3 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="CUSU-TR-BATTERY",
            controllable_unit_id=cu.id,
            technology=[Technology.BATTERY],
            maximum_active_power=30.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr3, TechnicalResourceResponse)

    tr4 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="CUSU-TR-HVAC",
            controllable_unit_id=cu.id,
            technology=[Technology.HVAC],
            maximum_active_power=15.0,
            device_type=DeviceType.HVAC,
        ),
    )
    assert isinstance(tr4, TechnicalResourceResponse)

    tr5 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="CUSU-TR-HYBRID",
            controllable_unit_id=cu.id,
            technology=[Technology.SOLAR, Technology.BATTERY],
            maximum_active_power=25.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr5, TechnicalResourceResponse)

    summary = read_controllable_unit_summary.sync(client=client_fiso, id=cu.id)
    assert isinstance(summary, ControllableUnitSummaryResponse)

    # what we've added:
    #   TR1 is solar (production) with MAP=10.0
    #   TR2 is solar (production) with MAP=20.0
    #   TR3 is battery (energy_storage) with MAP=30.0
    #   TR4 is hvac (consumption) with MAP=15.0
    #   TR5 is solar+battery (production+energy_storage) with MAP=25.0

    agg = summary.technical_resource

    # should be 5 TR in the summary
    assert agg.count == 5

    # sum MAP should be 100
    assert agg.maximum_active_power.sum_ == pytest.approx(100.0)

    # average MAP should be total 100 for 5 TR = 20
    assert agg.maximum_active_power.average == pytest.approx(20.0)

    # should be 3 solar, 2 battery, 1 hvac
    by_tech = agg.by_technology
    assert by_tech["solar"].count == 3
    assert by_tech["battery"].count == 2
    assert by_tech["hvac"].count == 1

    # sum MAP for solar should be 55 (TR1+TR2+TR5)
    assert by_tech["solar"].maximum_active_power.sum_ == pytest.approx(55.0)

    # average MAP for solar should be 55/3 (TR1+TR2+TR5)
    assert by_tech["solar"].maximum_active_power.average == pytest.approx(18.33333)

    # sum for production should be 55 (TR1+TR2+TR5)
    by_cat = agg.by_category
    assert by_cat["production"].maximum_active_power.sum_ == pytest.approx(55.0)

    # sum for consumption should be 15 (TR4)
    assert by_cat["consumption"].maximum_active_power.sum_ == pytest.approx(15.0)

    # sum for energy_storage should be 55 (TR3+TR5)
    assert by_cat["energy_storage"].maximum_active_power.sum_ == pytest.approx(55.0)
