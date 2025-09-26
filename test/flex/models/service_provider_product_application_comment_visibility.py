from enum import Enum


class ServiceProviderProductApplicationCommentVisibility(str, Enum):
    ANY_INVOLVED_PARTY = "any_involved_party"
    SAME_PARTY = "same_party"

    def __str__(self) -> str:
        return str(self.value)
