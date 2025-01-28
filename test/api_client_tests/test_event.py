from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import EventResponse, ErrorMessage
from flex.api.event import (
    list_event,
    read_event,
)
from typing import cast

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: EVENT-COM001
def test_event_common(sts):
    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # endpoint: GET /event
        events = list_event.sync(client=client)
        assert isinstance(events, list)
        assert len(events) > 0
        assert isinstance(events[0], EventResponse)

        # endpoint: GET /event/{id}
        event = read_event.sync(client=client, id=cast(int, events[0].id))
        assert isinstance(event, EventResponse)


def test_event_anon(sts):
    client = sts.get_client()

    events = list_event.sync(client=client)
    assert isinstance(events, ErrorMessage)
    assert events.message.startswith("permission denied")


def test_event_ent(sts):
    client_ent = sts.get_client(TestEntity.TEST)

    events = list_event.sync(client=client_ent)
    assert isinstance(events, ErrorMessage)
    assert events.message.startswith("permission denied")
