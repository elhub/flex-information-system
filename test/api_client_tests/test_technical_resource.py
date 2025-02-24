from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitServiceProviderResponse,
    ControllableUnitServiceProviderCreateRequest,
    ErrorMessage,
    EmptyObject,
    ControllableUnitResponse,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    TechnicalResourceResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceUpdateRequest,
    TechnicalResourceHistoryResponse,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
    list_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.technical_resource import (
    create_technical_resource,
    list_technical_resource,
    read_technical_resource,
    update_technical_resource,
    delete_technical_resource,
    read_technical_resource_history,
    list_technical_resource_history,
)
import pytest
from typing import cast


@pytest.fixture
def data():
    sts = SecurityTokenService()

    # create a test controllable unit
    cu = create_controllable_unit.sync(
        client=sts.get_client(TestEntity.TEST, "FISO"),
        body=ControllableUnitCreateRequest(
            name="New CU",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    yield (sts, cu.id)


# ---- ---- ---- ---- ----


def technical_resource_test_for_client(client, cu_id):
    # get initial number of TR related to this CU
    # endpoint: GET /technical_resource
    tr_cu = list_technical_resource.sync(
        client=client,
        controllable_unit_id=f"eq.{cu_id}",
    )
    assert isinstance(tr_cu, list)

    # add a new TR to the CU
    # endpoint: POST /technical_resource
    tr = create_technical_resource.sync(
        client=client,
        body=TechnicalResourceCreateRequest(
            name="New TR",
            controllable_unit_id=cu_id,
            details="Details of the new TR",
        ),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    # update the name of the TR
    # endpoint: PATCH /technical_resource/{id}
    u = update_technical_resource.sync(
        client=client,
        id=cast(int, tr.id),
        body=TechnicalResourceUpdateRequest(
            name="New TR2",
            details="updated",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # check that the name has been updated
    # endpoint: GET /technical_resource/{id}
    tr = read_technical_resource.sync(client=client, id=cast(int, tr.id))
    assert isinstance(tr, TechnicalResourceResponse)
    assert tr.name == "New TR2"
    assert tr.details == "updated"

    # endpoint: DELETE /technical_resource/{id}
    d = delete_technical_resource.sync(
        client=client,
        id=cast(int, tr.id),
        body=EmptyObject(),
    )
    assert not (isinstance(d, ErrorMessage))


def test_tr(data):
    (sts, cu_id) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # RLS: TR-FISO001
    technical_resource_test_for_client(client_fiso, cu_id)

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]
    # link the CU to the SP to test their granted authorisations
    cusp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp_id,
            contract_reference="TEST-CONTRACT",
            valid_from="2020-01-01T00:00:00+1",
            valid_to=None,
        ),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    # RLS: TR-SP001
    technical_resource_test_for_client(client_sp, cu_id)


def test_tr_common(data):
    (sts, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # RLS: TR-COM001
        # can read history on TR they can read
        tr_visible = list_technical_resource.sync(
            client=client,
        )
        assert isinstance(tr_visible, list)

        # only checking a few entries is sufficient
        for tr in tr_visible[:5]:
            # endpoint: GET /technical_resource_history
            hist = list_technical_resource_history.sync(
                client=client,
                technical_resource_id=f"eq.{tr.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /technical_resource_history/{id}
            hist_tr = read_technical_resource_history.sync(
                client=client, id=cast(int, hist[0].id)
            )
            assert isinstance(hist_tr, TechnicalResourceHistoryResponse)

        # RLS: TR-COM002
        # can read TR from CU they can read
        cu_visible = list_controllable_unit.sync(
            client=client,
        )
        assert isinstance(cu_visible, list)

        # only checking a few entries is sufficient
        for cu in cu_visible[:5]:
            tr_cu = list_technical_resource.sync(
                client=client_fiso,
                controllable_unit_id=f"eq.{cu.id}",
            )
            assert isinstance(tr_cu, list)

            tr_cu_visible = list_technical_resource.sync(
                client=client,
                controllable_unit_id=f"eq.{cu.id}",
            )
            assert isinstance(tr_cu_visible, list)

            assert len(tr_cu) == len(tr_cu_visible)


def test_rla_absence(data):
    (sts, _) = data

    roles_without_rla = ["TP"]

    for role in roles_without_rla:
        trs = list_technical_resource.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(trs, list)
        assert len(trs) == 0
