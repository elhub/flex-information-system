"""
Tests for SPGPAA (Service Providing Group Product Application Attachment).

Focuses on:
  - SPGPAA-FISO001: FISO can upload, download, and delete attachments.
  - SPGPAA-SP001: SP can upload, download, and delete their own attachments,
    but cannot access attachments on another SP's SPGPA.
  - SPGPAA-COM001: only involved parties (procuring SO and SP of the SPG) can
    read attachments on a SPGPA.

Note: the 'upload with read-only scope returns 403' case is not included because
the real auth server always issues manage+read scopes together; testing scope
restrictions at the JWT level requires an in-process test setup.
"""

from io import BytesIO
from typing import cast

import pytest
from flex.api.controllable_unit import create_controllable_unit
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    update_service_providing_group,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)
from flex.api.system_operator_product_type import create_system_operator_product_type
from flex.api.service_providing_group_product_application import (
    create_service_providing_group_product_application,
)
from flex.api.service_providing_group_product_application_attachment import (
    create_service_providing_group_product_application_attachment,
    delete_service_providing_group_product_application_attachment,
    list_service_providing_group_product_application_attachment,
    read_service_providing_group_product_application_attachment,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationResponse,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplicationResponse,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ErrorMessage,
)
from flex.models.create_service_providing_group_product_application_attachment_body import (
    CreateServiceProvidingGroupProductApplicationAttachmentBody,
)
from flex.models.service_providing_group_product_application_attachment_response import (
    ServiceProvidingGroupProductApplicationAttachmentResponse,
)
from flex.types import File
from flex import AuthenticatedClient
from security_token_service import SecurityTokenService, TestEntity
import datetime


# return a structurally minimal but valid single-page PDF
def minimal_pdf() -> bytes:
    stream = b"BT /F1 12 Tf 72 720 Td (hello) Tj ET"
    length = len(stream)
    parts = []
    offsets = []

    def w(s: bytes):
        parts.append(s)

    def size():
        return sum(len(p) for p in parts)

    w(b"%PDF-1.4\n")
    offsets.append(size())
    w(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    offsets.append(size())
    w(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    offsets.append(size())
    w(
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R "
        b"/MediaBox [0 0 612 792] /Contents 4 0 R /Resources "
        b"<< /Font << /F1 5 0 R >> >> >>\nendobj\n"
    )
    offsets.append(size())
    w(f"4 0 obj\n<< /Length {length} >>\nstream\n".encode())
    w(stream)
    w(b"\nendstream\nendobj\n")
    offsets.append(size())
    w(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    xref_offset = size()
    w(b"xref\n0 6\n")
    w(b"0000000000 65535 f \n")
    for off in offsets:
        w(f"{off:010d} 00000 n \n".encode())
    w(b"trailer\n<< /Size 6 /Root 1 0 R >>\n")
    w(f"startxref\n{xref_offset}\n%%EOF\n".encode())
    return b"".join(parts)


def _make_file(pdf_bytes: bytes, filename: str = "test.pdf") -> File:
    return File(
        payload=BytesIO(pdf_bytes), file_name=filename, mime_type="application/pdf"
    )


# upload a PDF to the given SPGPA
def upload_attachment(
    client: AuthenticatedClient,
    spgpa_id: int,
    filename: str = "test.pdf",
    pdf_bytes: bytes | None = None,
):
    if pdf_bytes is None:
        pdf_bytes = minimal_pdf()
    body = CreateServiceProvidingGroupProductApplicationAttachmentBody(
        service_providing_group_product_application_id=spgpa_id,
        file=_make_file(pdf_bytes, filename),
    )
    return create_service_providing_group_product_application_attachment.sync(
        client=client,
        body=body,
    )


# like above, but returns the full response including status code
def upload_attachment_detailed(
    client: AuthenticatedClient,
    spgpa_id: int,
    filename: str = "test.pdf",
    pdf_bytes: bytes | None = None,
):
    if pdf_bytes is None:
        pdf_bytes = minimal_pdf()
    body = CreateServiceProvidingGroupProductApplicationAttachmentBody(
        service_providing_group_product_application_id=spgpa_id,
        file=_make_file(pdf_bytes, filename),
    )
    return create_service_providing_group_product_application_attachment.sync_detailed(
        client=client,
        body=body,
    )


# download without following the redirect so we can inspect the raw response
def download_attachment_no_redirect(client: AuthenticatedClient, attachment_id: int):
    return client.get_httpx_client().request(
        "GET",
        f"/service_providing_group_product_application_attachment/{attachment_id}/download",
        follow_redirects=False,
    )


def delete_attachment(client: AuthenticatedClient, attachment_id: int):
    return delete_service_providing_group_product_application_attachment.sync(
        id=attachment_id,
        client=client,
    )


# like above but returns the full response including status code
def delete_attachment_detailed(client: AuthenticatedClient, attachment_id: int):
    return delete_service_providing_group_product_application_attachment.sync_detailed(
        id=attachment_id,
        client=client,
    )


def list_attachments(client: AuthenticatedClient, spgpa_id: int):
    return list_service_providing_group_product_application_attachment.sync(
        client=client,
        service_providing_group_product_application_id=f"eq.{spgpa_id}",
    )


def read_attachment(client: AuthenticatedClient, attachment_id: int):
    return read_service_providing_group_product_application_attachment.sync(
        id=attachment_id,
        client=client,
    )


# create and activate a full SPGPA chain for the given SP/SO
def _create_spgpa(
    client_fiso: AuthenticatedClient,
    client_sp: AuthenticatedClient,
    client_so: AuthenticatedClient,
    sp_id: int,
    so_id: int,
    eu_id: int,
    pt_id: int,
) -> int:
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CU for SPGPAA test",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="SPGPAA-TEST",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="SPG for SPGPAA test",
            service_provider_id=sp_id,
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE
        ),
    )
    assert not isinstance(u, ErrorMessage)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so_id,
            product_type_ids=[pt_id],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_so,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert not isinstance(u, ErrorMessage)

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=cast(int, spg.id),
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_id],
            maximum_active_power_up=3.5,
            maximum_active_power_down=3.5,
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    return cast(int, spgpa.id)


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    # SP1 owns the primary SPGPA used in most tests
    client_sp = cast(AuthenticatedClient, sts.fresh_client(TestEntity.TEST, "SP"))
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # SP2 owns a second SPGPA used in SP-isolation tests
    client_sp2 = cast(AuthenticatedClient, sts.fresh_client(TestEntity.TEST, "SP"))
    sp2_id = sts.get_userinfo(client_sp2)["party_id"]

    # SO is the procuring system operator (involved party for both SPGPAs)
    client_so = cast(AuthenticatedClient, sts.fresh_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    # Unrelated SO, not involved in any SPGPA we create
    client_other_so = cast(
        AuthenticatedClient, sts.fresh_client(TestEntity.COMMON, "SO")
    )

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    pt_id = 5  # manual_congestion product type

    # SO must register the product type before SPs can apply
    sopt = create_system_operator_product_type.sync(
        client=client_so,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=pt_id,
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    spgpa_id = _create_spgpa(
        client_fiso, client_sp, client_so, sp_id, so_id, eu_id, pt_id
    )
    spgpa_id_sp2 = _create_spgpa(
        client_fiso, client_sp2, client_so, sp2_id, so_id, eu_id, pt_id
    )

    yield (
        sts,
        client_sp,
        client_sp2,
        client_so,
        client_other_so,
        client_fiso,
        spgpa_id,
        spgpa_id_sp2,
    )


# RLS: SPGPAA-FISO001
def test_spgpaa_fiso(data):
    (_, _, _, client_so, _, client_fiso, spgpa_id, _) = data

    # SO role is not allowed to upload (only FISO and SP)
    resp = upload_attachment_detailed(client_so, spgpa_id)
    assert resp.status_code.value == 403

    # endpoint: POST /service_providing_group_product_application_attachment
    # FISO can upload a valid PDF
    a = upload_attachment(client_fiso, spgpa_id, filename="hello.pdf")
    assert isinstance(a, ServiceProvidingGroupProductApplicationAttachmentResponse)
    assert a.filename == "hello.pdf"
    assert str(a.content_type.value) == "application/pdf"
    assert a.service_providing_group_product_application_id == spgpa_id

    # FISO can upload a second PDF to the same SPGPA
    a2 = upload_attachment(client_fiso, spgpa_id, filename="second.pdf")
    assert isinstance(a2, ServiceProvidingGroupProductApplicationAttachmentResponse)

    # a file exceeding the 20 MB size limit is rejected
    resp = upload_attachment_detailed(
        client_fiso, spgpa_id, filename="big.pdf", pdf_bytes=bytes(20_000_001)
    )
    assert resp.status_code.value == 400

    # endpoint: GET /service_providing_group_product_application_attachment/{id}/download
    # download of a non-existent ID returns not found
    raw = download_attachment_no_redirect(client_fiso, 999_999_999)
    assert raw.status_code == 404

    # download of a valid ID returns a redirect with a non-empty Location header
    raw = download_attachment_no_redirect(client_fiso, cast(int, a.id))
    assert raw.status_code in (301, 302)
    assert raw.headers.get("location") or raw.headers.get("Location")

    # endpoint: DELETE /service_providing_group_product_application_attachment/{id}
    # delete of a non-existent ID returns not found
    resp = delete_attachment_detailed(client_fiso, 999_999_999)
    assert resp.status_code.value == 404

    # delete of a valid ID works, but a subsequent download returns not found
    result = delete_attachment(client_fiso, cast(int, a.id))
    assert result is None
    raw = download_attachment_no_redirect(client_fiso, cast(int, a.id))
    assert raw.status_code == 404


# RLS: SPGPAA-SP001
def test_spgpaa_sp(data):
    (_, client_sp, client_sp2, _, _, _, spgpa_id, _) = data

    # endpoint: POST /service_providing_group_product_application_attachment
    # SP1 can upload to their own SPGPA
    a = upload_attachment(client_sp, spgpa_id, filename="sp1.pdf")
    assert isinstance(a, ServiceProvidingGroupProductApplicationAttachmentResponse)

    # SP2 cannot upload to SP1's SPGPA
    resp = upload_attachment_detailed(client_sp2, spgpa_id)
    assert resp.status_code.value == 403

    # endpoint: DELETE /service_providing_group_product_application_attachment/{id}
    # SP2 cannot delete SP1's attachment (not found because RLS hides the row)
    resp = delete_attachment_detailed(client_sp2, cast(int, a.id))
    assert resp.status_code.value == 404

    # SP1 can delete their own attachment
    result = delete_attachment(client_sp, cast(int, a.id))
    assert result is None


# RLS: SPGPAA-COM001
def test_spgpaa_com001(data):
    (_, client_sp, _, client_so, client_other_so, client_fiso, spgpa_id, _) = data

    # FISO uploads an attachment so we have something to test read visibility against
    a = upload_attachment(client_fiso, spgpa_id)
    assert isinstance(a, ServiceProvidingGroupProductApplicationAttachmentResponse)
    attachment_id = cast(int, a.id)

    # endpoint: GET /service_providing_group_product_application_attachment
    # SP is an involved party (owner of the SPG), can list and read
    sp_list = list_attachments(client_sp, spgpa_id)
    assert isinstance(sp_list, list)
    assert any(a.id == attachment_id for a in sp_list)

    # endpoint: GET /service_providing_group_product_application_attachment/{id}
    sp_read = read_attachment(client_sp, attachment_id)
    assert isinstance(
        sp_read, ServiceProvidingGroupProductApplicationAttachmentResponse
    )

    # SO is an involved party (PSO), can list and read
    so_list = list_attachments(client_so, spgpa_id)
    assert isinstance(so_list, list)
    assert any(a.id == attachment_id for a in so_list)

    so_read = read_attachment(client_so, attachment_id)
    assert isinstance(
        so_read, ServiceProvidingGroupProductApplicationAttachmentResponse
    )

    # SO can download (redirect to presigned URL)
    raw = download_attachment_no_redirect(client_so, attachment_id)
    assert raw.status_code in (301, 302)

    # SO cannot upload or delete (wrong role, only FISO and SP are allowed)
    resp = upload_attachment_detailed(client_so, spgpa_id, filename="so-upload.pdf")
    assert resp.status_code.value == 403
    resp = delete_attachment_detailed(client_so, attachment_id)
    assert resp.status_code.value == 403

    # unrelated SO is not an involved party, all rows are hidden
    # endpoint: GET /service_providing_group_product_application_attachment
    other_so_list = list_attachments(client_other_so, spgpa_id)
    if isinstance(other_so_list, list):
        assert not any(a.id == attachment_id for a in other_so_list)

    # endpoint: GET /service_providing_group_product_application_attachment/{id}
    other_so_read = read_attachment(client_other_so, attachment_id)
    assert not isinstance(
        other_so_read, ServiceProvidingGroupProductApplicationAttachmentResponse
    )
