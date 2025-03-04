from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ErrorMessage,
    EmptyObject,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    TechnicalResourceResponse,
    TechnicalResourceCreateRequest,
    TechnicalResourceUpdateRequest,
    TechnicalResourceHistoryResponse,
)
from flex.api.controllable_unit import (
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
from datetime import date


@pytest.fixture
def sts():
    yield SecurityTokenService()


# ---- ---- ---- ---- ----


# RLS: TR-BRP001
# RLS: TR-BRP002
def test_tr_brp(sts):
    # former AP BRP can see the old version of the TRs in the test data,
    # but not the current record

    client_former_brp = sts.get_client(TestEntity.COMMON, "BRP")

    # endpoint: GET /technical_resource_history
    trhs_former_brp = list_technical_resource_history.sync(client=client_former_brp)
    assert isinstance(trhs_former_brp, list)

    assert len(trhs_former_brp) > 0

    old_trhs = list(
        filter(
            lambda trh: "FORMER NAME" in cast(str, trh.name),
            trhs_former_brp,
        )
    )
    assert len(old_trhs) > 0

    # endpoint: GET /technical_resource/{id}
    tr = read_technical_resource.sync(
        client=client_former_brp,
        id=cast(int, old_trhs[0].technical_resource_id),
    )
    assert isinstance(tr, TechnicalResourceResponse)
    assert "FORMER NAME" in cast(str, tr.name)

    # current AP BRP can see the current version of the TR,
    # but not the old records

    client_brp = sts.get_client(TestEntity.TEST, "BRP")

    tr = read_technical_resource.sync(
        client=client_brp,
        id=cast(int, old_trhs[0].technical_resource_id),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    trhs_brp = list_technical_resource_history.sync(client=client_brp)
    assert isinstance(trhs_brp, list)

    old_trhs = list(
        filter(
            lambda trh: "FORMER NAME" in cast(str, trh.name),
            trhs_brp,
        )
    )
    assert len(old_trhs) == 0


# RLS: TR-EU001
# RLS: TR-EU002
def test_tr_eu(sts):
    # former AP EU can see the old version of the TRs in the test data,
    # but not the current record

    client_former_eu = sts.get_client(TestEntity.COMMON, "EU")

    trhs_former_eu = list_technical_resource_history.sync(client=client_former_eu)
    assert isinstance(trhs_former_eu, list)

    assert len(trhs_former_eu) > 0

    old_trhs = list(
        filter(
            lambda trh: "FORMER NAME" in cast(str, trh.name),
            trhs_former_eu,
        )
    )
    assert len(old_trhs) > 0

    tr = read_technical_resource.sync(
        client=client_former_eu,
        id=cast(int, old_trhs[0].technical_resource_id),
    )
    assert isinstance(tr, TechnicalResourceResponse)
    assert "FORMER NAME" in cast(str, tr.name)

    # current AP EU can see the current version of the TR,
    # but not the old records

    client_eu = sts.get_client(TestEntity.TEST, "EU")

    tr = read_technical_resource.sync(
        client=client_eu,
        id=cast(int, old_trhs[0].technical_resource_id),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    trhs_eu = list_technical_resource_history.sync(client=client_eu)
    assert isinstance(trhs_eu, list)

    old_trhs = list(
        filter(
            lambda trh: "FORMER NAME" in cast(str, trh.name),
            trhs_eu,
        )
    )
    assert len(old_trhs) == 0


# RLS: TR-ES001
# RLS: TR-ES002
def test_tr_es(sts):
    # former AP ES can see the old version of the TRs in the test data,
    # but not the current record

    client_former_es = sts.get_client(TestEntity.COMMON, "ES")

    trhs_former_es = list_technical_resource_history.sync(client=client_former_es)
    assert isinstance(trhs_former_es, list)

    assert len(trhs_former_es) > 0

    old_trhs = list(
        filter(
            lambda trh: "FORMER NAME" in cast(str, trh.name),
            trhs_former_es,
        )
    )
    assert len(old_trhs) > 0

    tr = read_technical_resource.sync(
        client=client_former_es,
        id=cast(int, old_trhs[0].technical_resource_id),
    )
    assert isinstance(tr, TechnicalResourceResponse)
    assert "FORMER NAME" in cast(str, tr.name)

    # current AP ES can see the current version of the TR,
    # but not the old records

    client_es = sts.get_client(TestEntity.TEST, "ES")

    tr = read_technical_resource.sync(
        client=client_es,
        id=cast(int, old_trhs[0].technical_resource_id),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    trhs_es = list_technical_resource_history.sync(client=client_es)
    assert isinstance(trhs_es, list)

    old_trhs = list(
        filter(
            lambda trh: "FORMER NAME" in cast(str, trh.name),
            trhs_es,
        )
    )
    assert len(old_trhs) == 0


def test_tr_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # RLS: TR-FISO002
    # FISO can read all TR history

    trs = list_technical_resource_history.sync(client=client_fiso)
    assert isinstance(trs, list)
    assert len(trs) >= 27

    # RLS: TR-FISO001
    # FISO can do everything

    trs = list_technical_resource.sync(client=client_fiso)
    assert isinstance(trs, list)
    assert len(trs) >= 9

    # endpoint: POST /technical_resource
    tr = create_technical_resource.sync(
        client=client_fiso,
        body=TechnicalResourceCreateRequest(
            name="New TR",
            controllable_unit_id=1,
            details="Details of the new TR",
        ),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    # endpoint: PATCH /technical_resource/{id}
    u = update_technical_resource.sync(
        client=client_fiso,
        id=cast(int, tr.id),
        body=TechnicalResourceUpdateRequest(
            name="New TR2",
            details="updated",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # endpoint: DELETE /technical_resource/{id}
    d = delete_technical_resource.sync(
        client=client_fiso,
        id=cast(int, tr.id),
        body=EmptyObject(),
    )
    assert not (isinstance(d, ErrorMessage))


def test_tr_so(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    cus_so = list_controllable_unit.sync(client=client_so)
    assert isinstance(cus_so, list)

    for cu in cus_so[:3]:
        # RLS: TR-SO001
        # check SO can read TR when they can read CU

        # endpoint: GET /technical_resource
        trs_so = list_technical_resource.sync(
            client=client_so, controllable_unit_id=f"eq.{cu.id}"
        )
        assert isinstance(trs_so, list)

        trs = list_technical_resource.sync(
            client=client_fiso, controllable_unit_id=f"eq.{cu.id}"
        )
        assert isinstance(trs, list)

        assert len(trs_so) == len(trs)

        tr = read_technical_resource.sync(
            client=client_so,
            id=cast(int, trs_so[0].id),
        )
        assert isinstance(tr, TechnicalResourceResponse)

        # RLS: TR-SO002
        # check SO can read history on these TR

        for tr in trs_so[:3]:
            hist = list_technical_resource_history.sync(
                client=client_so,
                technical_resource_id=f"eq.{tr.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 1

            # endpoint: GET /technical_resource_history/{id}
            hist_tr = read_technical_resource_history.sync(
                client=client_so, id=cast(int, hist[0].id)
            )
            assert isinstance(hist_tr, TechnicalResourceHistoryResponse)


# RLS: TR-SP001
# RLS: TR-SP002
# RLS: TR-SP003
def test_tr_sp(sts):
    client_sp = sts.get_client(TestEntity.TEST, "SP")
    client_common_sp = sts.get_client(TestEntity.COMMON, "SP")

    # Test SP cannot see CUSTOM FORMER TR, but Common SP can because the update
    # happened during their contract

    trs_sp = list_technical_resource.sync(client=client_sp)
    assert isinstance(trs_sp, list)
    trhs_sp = list_technical_resource_history.sync(client=client_sp)
    assert isinstance(trhs_sp, list)

    trs_common_sp = list_technical_resource.sync(client=client_common_sp)
    assert isinstance(trs_common_sp, list)
    trhs_common_sp = list_technical_resource_history.sync(client=client_common_sp)
    assert isinstance(trhs_common_sp, list)

    assert any("CUSTOM FORMER TR" in cast(str, tr.name) for tr in trs_common_sp)
    assert not any("CUSTOM FORMER TR" in cast(str, tr.name) for tr in trs_sp)

    assert any("CUSTOM FORMER TR" in cast(str, trh.name) for trh in trhs_common_sp)
    assert not any("CUSTOM FORMER TR" in cast(str, trh.name) for trh in trhs_sp)

    cu_id = trs_sp[0].controllable_unit_id

    # Common SP cannot create or update TR

    tr = create_technical_resource.sync(
        client=client_common_sp,
        body=TechnicalResourceCreateRequest(
            name="New TR",
            controllable_unit_id=cu_id,
            details="Details of the new TR",
        ),
    )
    assert isinstance(tr, ErrorMessage)

    u = update_technical_resource.sync(
        client=client_common_sp,
        id=cast(int, trs_common_sp[0].id),
        body=TechnicalResourceUpdateRequest(
            details="updated",
        ),
    )
    assert isinstance(u, ErrorMessage)

    # Test SP can update

    u = update_technical_resource.sync(
        client=client_sp,
        id=cast(int, trs_sp[0].id),
        body=TechnicalResourceUpdateRequest(
            details="updated",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # add common CUSP from today midnight

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    common_sp_id = sts.get_userinfo(client_common_sp)["party_id"]
    cusp_common = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=common_sp_id,
            contract_reference="1111r4128",
            valid_from=f"{date.today().isoformat()} Europe/Oslo",
        ),
    )
    assert isinstance(cusp_common, ControllableUnitServiceProviderResponse)

    # now Common SP can create/update TR

    tr = create_technical_resource.sync(
        client=client_common_sp,
        body=TechnicalResourceCreateRequest(
            name="TRSP45",
            controllable_unit_id=cu_id,
            details="Details of the new TR",
        ),
    )
    assert isinstance(tr, TechnicalResourceResponse)

    u = update_technical_resource.sync(
        client=client_common_sp,
        id=cast(int, tr.id),
        body=TechnicalResourceUpdateRequest(
            details="updated TRSP45",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # Test SP cannot, and cannot see the changes

    trs_sp = list_technical_resource.sync(client=client_sp)
    assert isinstance(trs_sp, list)
    assert not (any("TRSP45" in cast(str, tr.name) for tr in trs_sp))

    failtr = create_technical_resource.sync(
        client=client_sp,
        body=TechnicalResourceCreateRequest(
            name="fail",
            controllable_unit_id=cu_id,
        ),
    )
    assert isinstance(failtr, ErrorMessage)

    u = update_technical_resource.sync(
        client=client_sp,
        id=cast(int, tr.id),
        body=TechnicalResourceUpdateRequest(
            details="fail update",
        ),
    )
    assert isinstance(u, ErrorMessage)


def test_rla_absence(sts):
    roles_without_rla = ["TP"]

    for role in roles_without_rla:
        trs = list_technical_resource.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(trs, list)
        assert len(trs) == 0
