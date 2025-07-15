from enum import Enum


class EntityLookupRequestType(str, Enum):
    ORGANISATION = "organisation"
    PERSON = "person"

    def __str__(self) -> str:
        return str(self.value)
