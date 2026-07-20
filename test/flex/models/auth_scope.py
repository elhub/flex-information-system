from enum import StrEnum


class AuthScope(StrEnum):
    MANAGEATTACHMENT = "manage:attachment"
    MANAGEAUTH = "manage:auth"
    MANAGEDATA = "manage:data"
    MANAGEDATAENTITY_CLIENT = "manage:data:entity_client"
    MANAGEDATAPARTY_MEMBERSHIP = "manage:data:party_membership"
    READATTACHMENT = "read:attachment"
    READAUTH = "read:auth"
    READDATA = "read:data"
    USEATTACHMENT = "use:attachment"
    USEAUTH = "use:auth"
    USEDATA = "use:data"
    USEDATAENTITYLOOKUP = "use:data:entity:lookup"

    def __str__(self) -> str:
        return str(self.value)
