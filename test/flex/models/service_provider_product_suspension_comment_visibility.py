from enum import StrEnum


class ServiceProviderProductSuspensionCommentVisibility(StrEnum):
    ANY_INVOLVED_PARTY = "any_involved_party"
    SAME_PARTY = "same_party"
    SAME_PARTY_TYPE = "same_party_type"

    def __str__(self) -> str:
        return str(self.value)
