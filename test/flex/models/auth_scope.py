from enum import Enum


class AuthScope(str, Enum):
    MANAGEAUTH = "manage:auth"
    MANAGEDATA = "manage:data"
    MANAGEDATAENTITY_CLIENT = "manage:data:entity_client"
    MANAGEDATAPARTY_MEMBERSHIP = "manage:data:party_membership"
    READAUTH = "read:auth"
    READDATA = "read:data"
    USEAUTH = "use:auth"
    USEDATA = "use:data"
    USEDATAENTITYLOOKUP = "use:data:entity:lookup"

    def __str__(self) -> str:
        return str(self.value)
