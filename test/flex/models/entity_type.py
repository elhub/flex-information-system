from enum import StrEnum


class EntityType(StrEnum):
    ORGANISATION = "organisation"
    PERSON = "person"

    def __str__(self) -> str:
        return str(self.value)
