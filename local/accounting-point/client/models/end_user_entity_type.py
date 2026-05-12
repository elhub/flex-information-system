from enum import Enum


class EndUserEntityType(str, Enum):
    ORGANISATION = "organisation"
    PERSON = "person"

    def __str__(self) -> str:
        return str(self.value)
