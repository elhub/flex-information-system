from enum import Enum


class ServiceProviderProductApplicationCommentVisibility(str, Enum):
    ANY_PARTY = "any_party"
    SAME_PARTY = "same_party"
    SAME_PARTY_TYPE = "same_party_type"

    def __str__(self) -> str:
        return str(self.value)
