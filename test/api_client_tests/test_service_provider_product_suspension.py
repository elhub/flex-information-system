from security_token_service import (
    SecurityTokenService,
    AuthenticatedClient,
    TestEntity,
)
from flex.models import (
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ServiceProviderProductApplicationResponse,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductSuspensionHistoryResponse,
    ServiceProviderProductSuspensionResponse,
    ServiceProviderProductSuspensionUpdateRequest,
    ServiceProviderProductSuspensionCreateRequest,
    ServiceProviderProductSuspensionReason,
    ErrorMessage,
    EmptyObject,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    update_service_provider_product_application,
    create_service_provider_product_application,
)
from flex.api.service_provider_product_suspension import (
    list_service_provider_product_suspension,
    read_service_provider_product_suspension,
    update_service_provider_product_suspension,
    create_service_provider_product_suspension,
    delete_service_provider_product_suspension,
    list_service_provider_product_suspension_history,
    read_service_provider_product_suspension_history,
)
import pytest
from typing import cast


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    # 2 new SO, 1 new SP

    client_so = sts.fresh_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_so2 = sts.fresh_client(TestEntity.TEST, "SO")
    so2_id = sts.get_userinfo(client_so2)["party_id"]

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # chain of dependency to be able to create SP product suspensions:
    #   active SO product type -> qualfiied SP product application -> suspension

    # one product type in common so we can test SPPS-SO002 properly
    product_type_ids = [3, 5]
    product_type_ids2 = [5, 7]
    common_product_type_id = 5

    for clt, id, pt_ids in [
        (client_so, so_id, product_type_ids),
        (client_so2, so2_id, product_type_ids2),
    ]:
        for pt_id in pt_ids:
            sopt = create_system_operator_product_type.sync(
                client=client_fiso,
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
            ),
        )
        assert not isinstance(u, ErrorMessage)

    so = (client_so, so_id)
    so2 = (client_so2, so2_id)

    yield (sts, so, so2, product_type_ids, common_product_type_id, client_sp, sp_id)


# ---- ---- ---- ---- ----


# RLS: SPPA-COM001
# function to check history (will be called in several tests)
# harder to write a general function because of fresh clients
def check_history(client, spps_id):
    # endpoint: GET /service_provider_product_suspension_history
    hist = list_service_provider_product_suspension_history.sync(
        client=client,
        service_provider_product_suspension_id=f"eq.{spps_id}",
    )
    assert isinstance(hist, list)
    assert len(hist) > 0

    # endpoint: GET /service_provider_product_suspension_history/{id}
    hist_spps = read_service_provider_product_suspension_history.sync(
        client=client,
        id=cast(int, hist[0].id),
    )
    assert isinstance(
        hist_spps,
        ServiceProviderProductSuspensionHistoryResponse,
    )


# RLS: SPPS-FISO001
def test_spps_fiso(data):
    sts, (_, so_id), _, product_type_ids, _, _, sp_id = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: POST /service_provider_product_suspension
    spps = create_service_provider_product_suspension.sync(
        client=client_fiso,
        body=ServiceProviderProductSuspensionCreateRequest(
            procuring_system_operator_id=so_id,
            service_provider_id=sp_id,
            product_type_ids=[product_type_ids[1]],
            reason=ServiceProviderProductSuspensionReason.CLEARING_ISSUES,
        ),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    # endpoint: GET /service_provider_product_suspension
    sppss = list_service_provider_product_suspension.sync(client=client_fiso)
    assert isinstance(sppss, list)
    assert len(sppss) > 0

    # endpoint: GET /service_provider_product_suspension/{id}
    spps = read_service_provider_product_suspension.sync(
        client=client_fiso,
        id=cast(int, sppss[0].id),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    check_history(client_fiso, spps.id)

    # endpoint: PATCH /service_provider_product_suspension/{id}
    u = update_service_provider_product_suspension.sync(
        client=client_fiso,
        id=cast(int, spps.id),
        body=ServiceProviderProductSuspensionUpdateRequest(
            product_type_ids=product_type_ids,
            reason=ServiceProviderProductSuspensionReason.FAILED_VERIFICATION,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # endpoint: DELETE /service_provider_product_suspension/{id}
    d = delete_service_provider_product_suspension.sync(
        client=client_fiso, id=cast(int, spps.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)


# RLS: SPPS-SP001
def test_spps_sp(data):
    sts, (_, so_id), _, product_type_ids, _, client_sp, sp_id = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    spps = create_service_provider_product_suspension.sync(
        client=client_fiso,
        body=ServiceProviderProductSuspensionCreateRequest(
            procuring_system_operator_id=so_id,
            service_provider_id=sp_id,
            product_type_ids=[product_type_ids[1]],
            reason=ServiceProviderProductSuspensionReason.CLEARING_ISSUES,
        ),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    # SP can read

    spps = read_service_provider_product_suspension.sync(
        client=client_sp,
        id=cast(int, spps.id),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    check_history(client_sp, spps.id)


def test_spps_so(data):
    _, so, so2, product_type_ids, common_product_type_id, _, sp_id = data
    client_so, _ = so

    # RLS: SPPS-SO001
    # SO can do everything on their own SPPS

    spps = create_service_provider_product_suspension.sync(
        client=client_so,
        body=ServiceProviderProductSuspensionCreateRequest(
            service_provider_id=sp_id,
            product_type_ids=[product_type_ids[1]],
            reason=ServiceProviderProductSuspensionReason.CLEARING_ISSUES,
        ),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    sppss = list_service_provider_product_suspension.sync(client=client_so)
    assert isinstance(sppss, list)
    assert len(sppss) > 0

    spps = read_service_provider_product_suspension.sync(
        client=client_so,
        id=cast(int, sppss[0].id),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    check_history(client_so, spps.id)

    u = update_service_provider_product_suspension.sync(
        client=client_so,
        id=cast(int, spps.id),
        body=ServiceProviderProductSuspensionUpdateRequest(
            product_type_ids=product_type_ids,
            reason=ServiceProviderProductSuspensionReason.FAILED_VERIFICATION,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    d = delete_service_provider_product_suspension.sync(
        client=client_so, id=cast(int, spps.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    # RLS: SPPS-SO002

    # the other SO will create a SPPS targeting the same SP with one common
    # product type, and the first SO must be able to read it

    client_so2, _ = so2

    spps = create_service_provider_product_suspension.sync(
        client=client_so2,
        body=ServiceProviderProductSuspensionCreateRequest(
            service_provider_id=sp_id,
            product_type_ids=[common_product_type_id],
            reason=ServiceProviderProductSuspensionReason.FAILING_HEARTBEAT,
        ),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)

    spps = read_service_provider_product_suspension.sync(
        client=client_so,
        id=cast(int, spps.id),
    )
    assert isinstance(spps, ServiceProviderProductSuspensionResponse)
