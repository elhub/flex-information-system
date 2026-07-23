# type: ignore[union-attr]
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
    DeviceType,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupSummaryResponse,
    ServiceProvidingGroupPowerPerSubstationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceResponse,
    Technology,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    list_service_providing_group,
)
from flex.api.service_providing_group_summary import (
    read_service_providing_group_summary,
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


# RLS: SPGSU-COM001
def test_service_providing_group_summary_common(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_sp = sts.get_client(TestEntity.TEST, "SP")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    for client in [client_fiso, client_sp, client_so]:
        spgs = list_service_providing_group.sync(client=client)
        assert isinstance(spgs, list)
        assert len(spgs) > 0

        spgsu = read_service_providing_group_summary.sync(client=client, id=spgs[0].id)
        assert isinstance(spgsu, ServiceProvidingGroupSummaryResponse)


def test_service_providing_group_summary_aggregation(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_eu = sts.get_client(TestEntity.TEST, "EU")
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # create an SPG with no memberships and check the summary exists with zeros

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="SPGSU-TEST-AGGREGATION",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    summary = read_service_providing_group_summary.sync(client=client_fiso, id=spg.id)
    assert isinstance(summary, ServiceProvidingGroupSummaryResponse)

    cu_agg = summary.controllable_unit
    assert cu_agg.count == 0
    assert cu_agg.maximum_active_power.sum_ == pytest.approx(0.0)

    tr_agg = summary.technical_resource
    assert tr_agg.count == 0
    assert tr_agg.maximum_active_power.sum_ == pytest.approx(0.0)
    assert tr_agg.by_technology.additional_properties == {}
    assert tr_agg.by_category.additional_properties == {}

    # add some CUs/TRs and check the summary values are correct

    cu1 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="SPGSU-TEST-AGGREGATION",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu1, ControllableUnitResponse)

    cu2 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="SPGSU-TEST-AGGREGATION",
            accounting_point_id=1003,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=100.0,
        ),
    )
    assert isinstance(cu2, ControllableUnitResponse)

    tr1 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGSU-TR-SOLAR-1",
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
            name="SPGSU-TR-SOLAR-2",
            controllable_unit_id=cu1.id,
            technology=[Technology.SOLAR],
            maximum_active_power=20.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr2, TechnicalResourceResponse)

    tr3 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGSU-TR-BATTERY",
            controllable_unit_id=cu2.id,
            technology=[Technology.BATTERY],
            maximum_active_power=30.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr3, TechnicalResourceResponse)

    tr4 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGSU-TR-HVAC",
            controllable_unit_id=cu2.id,
            technology=[Technology.HVAC],
            maximum_active_power=15.0,
            device_type=DeviceType.HVAC,
        ),
    )
    assert isinstance(tr4, TechnicalResourceResponse)

    tr5 = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="SPGSU-TR-HYBRID",
            controllable_unit_id=cu2.id,
            technology=[Technology.SOLAR, Technology.BATTERY],
            maximum_active_power=25.0,
            device_type=DeviceType.INVERTER,
        ),
    )
    assert isinstance(tr5, TechnicalResourceResponse)

    cusp1 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu1.id,
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
            valid_to=None,
        ),
    )
    assert isinstance(cusp1, ControllableUnitServiceProviderResponse)

    cusp2 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu2.id,
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
            valid_to=None,
        ),
    )
    assert isinstance(cusp2, ControllableUnitServiceProviderResponse)

    m1 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu1.id,
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(m1, ServiceProvidingGroupMembershipResponse)

    m2 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu2.id,
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(m2, ServiceProvidingGroupMembershipResponse)

    summary = read_service_providing_group_summary.sync(client=client_fiso, id=spg.id)
    assert isinstance(summary, ServiceProvidingGroupSummaryResponse)

    # what we've added:
    #   CU1
    #     TR1 is solar (production) with MAP=10.0
    #     TR2 is solar (production) with MAP=20.0
    #   CU2
    #     TR3 is battery (energy_storage) with MAP=30.0
    #     TR4 is hvac (consumption) with MAP=15.0
    #     TR5 is solar+battery (production+energy_storage) with MAP=25.0

    # first at CU level
    cu_agg = summary.controllable_unit

    # should be 2 CUs in the summary
    assert cu_agg.count == 2

    # sum MAP should be 100
    assert cu_agg.maximum_active_power.sum_ == pytest.approx(100.0)

    # average MAP should be total 100 for 2 CUs = 50
    assert cu_agg.maximum_active_power.average == pytest.approx(50.0)

    # now at TR level
    tr_agg = summary.technical_resource

    # should be 5 TR in the summary
    assert tr_agg.count == 5

    # sum MAP should be 100
    assert tr_agg.maximum_active_power.sum_ == pytest.approx(100.0)

    # average MAP should be total 100 for 5 TR = 20
    assert tr_agg.maximum_active_power.average == pytest.approx(20.0)

    # should be 3 solar, 2 battery, 1 hvac
    by_tech = tr_agg.by_technology
    assert by_tech["solar"].count == 3
    assert by_tech["battery"].count == 2
    assert by_tech["hvac"].count == 1

    # sum MAP for solar should be 55 (TR1+TR2+TR5)
    assert by_tech["solar"].maximum_active_power.sum_ == pytest.approx(55.0)

    # average MAP for solar should be 55/3 (TR1+TR2+TR5)
    assert by_tech["solar"].maximum_active_power.average == pytest.approx(18.33333)

    # sum for production should be 55 (TR1+TR2+TR5)
    by_cat = tr_agg.by_category
    assert by_cat["production"].maximum_active_power.sum_ == pytest.approx(55.0)

    # sum for consumption should be 15 (TR4)
    assert by_cat["consumption"].maximum_active_power.sum_ == pytest.approx(15.0)

    # sum for energy_storage should be 55 (TR3+TR5)
    assert by_cat["energy_storage"].maximum_active_power.sum_ == pytest.approx(55.0)


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
