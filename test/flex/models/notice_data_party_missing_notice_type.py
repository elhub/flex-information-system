from enum import Enum


class NoticeDataPartyMissingNoticeType(str, Enum):
    NO_ELHUB_FLEX_PARTY_MISSING = "no.elhub.flex.party.missing"

    def __str__(self) -> str:
        return str(self.value)
