"""
Tests for SPGPAA (Service Providing Group Product Application Attachment) RLS.

Focuses on:
  - SPGPAA-COM001: only involved parties (procuring SO and SP of the SPG) can
    read attachments on a SPGPA.
"""

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
from flex import AuthenticatedClient
from security_token_service import SecurityTokenService, TestEntity
import datetime


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def minimal_pdf() -> bytes:
    """Return a structurally minimal but valid single-page PDF."""
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


def upload_attachment(client: AuthenticatedClient, spgpa_id: int) -> dict | None:
    """
    Upload a minimal PDF attachment to the given SPGPA.
    Returns the parsed JSON response body on success, or None on failure.
    """
    pdf = minimal_pdf()
    response = client.get_httpx_client().post(
        "/service_providing_group_product_application_attachment",
        content=_multipart_body(spgpa_id, pdf),
        headers={"Content-Type": _multipart_content_type()},
    )
    if response.status_code == 201:
        return response.json()
    return None


_BOUNDARY = "PythonTestBoundary12345"


def _multipart_content_type() -> str:
    return f"multipart/form-data; boundary={_BOUNDARY}"


def _multipart_body(spgpa_id: int, file_bytes: bytes) -> bytes:
    b = _BOUNDARY.encode()
    parts = []
    # Field: service_providing_group_product_application_id
    parts.append(b"--" + b + b"\r\n")
    parts.append(
        b'Content-Disposition: form-data; name="service_providing_group_product_application_id"\r\n'
    )
    parts.append(b"\r\n")
    parts.append(str(spgpa_id).encode() + b"\r\n")
    # File part
    parts.append(b"--" + b + b"\r\n")
    parts.append(
        b'Content-Disposition: form-data; name="file"; filename="test.pdf"\r\n'
    )
    parts.append(b"Content-Type: application/pdf\r\n")
    parts.append(b"\r\n")
    parts.append(file_bytes)
    parts.append(b"\r\n")
    parts.append(b"--" + b + b"--\r\n")
    return b"".join(parts)


def list_attachments(client: AuthenticatedClient, spgpa_id: int) -> list | None:
    """
    List attachments for a SPGPA using the GET endpoint.
    Returns a list on success (may be empty), or None if access is denied / error.
    """
    response = client.get_httpx_client().get(
        "/service_providing_group_product_application_attachment",
        params={"service_providing_group_product_application_id": f"eq.{spgpa_id}"},
    )
    if response.status_code == 200:
        return response.json()
    return None


def read_attachment(client: AuthenticatedClient, attachment_id: int) -> dict | None:
    """
    Read a single attachment by ID.
    Returns the parsed JSON on success, or None if not found / denied.
    """
    response = client.get_httpx_client().get(
        f"/service_providing_group_product_application_attachment/{attachment_id}",
    )
    if response.status_code == 200:
        return response.json()
    return None


# ---------------------------------------------------------------------------
# Fixture
# ---------------------------------------------------------------------------


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    # SP that owns the SPG
    client_sp = cast(AuthenticatedClient, sts.fresh_client(TestEntity.TEST, "SP"))
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # SO that is the procuring system operator (involved party)
    client_so = cast(AuthenticatedClient, sts.fresh_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    # Unrelated SO — not involved in any SPGPA we create
    client_other_so = cast(
        AuthenticatedClient, sts.fresh_client(TestEntity.COMMON, "SO")
    )

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # ── Create and activate a SPG for the SP ─────────────────────────────────

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
            name="SPG for SPGPAA RLS test",
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
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # ── Qualify the SP for a product type with the SO ─────────────────────────

    pt_id = 5

    sopt = create_system_operator_product_type.sync(
        client=client_so,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so_id,
            product_type_id=pt_id,
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

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

    # ── Create a SPGPA ────────────────────────────────────────────────────────

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

    yield (
        sts,
        client_sp,
        client_so,
        client_other_so,
        client_fiso,
        cast(int, spgpa.id),
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


# RLS: SPGPAA-COM001
def test_spgpaa_com001(data):
    """
    Only involved parties (procuring SO and SP of the SPG) may read attachments
    on a SPGPA.  Unrelated parties must see nothing.
    """
    (sts, client_sp, client_so, client_other_so, client_fiso, spgpa_id) = data

    # FISO uploads an attachment so we have something to test reads against.
    attachment = upload_attachment(client_fiso, spgpa_id)
    assert attachment is not None, "FISO should be able to upload an attachment"
    attachment_id = attachment["id"]

    # ── SP is an involved party (service_provider of the SPG) ────────────────

    # endpoint: GET /service_providing_group_product_application_attachment
    sp_list = list_attachments(client_sp, spgpa_id)
    assert sp_list is not None
    assert any(a["id"] == attachment_id for a in sp_list), (
        "SP (involved party) should see the attachment in the list"
    )

    # endpoint: GET /service_providing_group_product_application_attachment/{id}
    sp_read = read_attachment(client_sp, attachment_id)
    assert sp_read is not None, (
        "SP (involved party) should be able to read the attachment"
    )

    # ── SO is an involved party (procuring_system_operator) ──────────────────

    so_list = list_attachments(client_so, spgpa_id)
    assert so_list is not None
    assert any(a["id"] == attachment_id for a in so_list), (
        "SO (involved party) should see the attachment in the list"
    )

    so_read = read_attachment(client_so, attachment_id)
    assert so_read is not None, (
        "SO (involved party) should be able to read the attachment"
    )

    # ── Unrelated SO is NOT an involved party ────────────────────────────────

    other_so_list = list_attachments(client_other_so, spgpa_id)
    # The endpoint may return an empty list (RLS filters rows) or an error.
    # Either way the attachment must not be visible.
    if other_so_list is not None:
        assert not any(a["id"] == attachment_id for a in other_so_list), (
            "Unrelated SO must not see the attachment in the list"
        )

    other_so_read = read_attachment(client_other_so, attachment_id)
    assert other_so_read is None, (
        "Unrelated SO must not be able to read the attachment by ID"
    )
