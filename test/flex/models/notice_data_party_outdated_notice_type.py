from enum import Enum


class NoticeDataPartyOutdatedNoticeType(str, Enum):
    NO_ELHUB_FLEX_PARTY_OUTDATED = "no.elhub.flex.party.outdated"

    def __str__(self) -> str:
        return str(self.value)
