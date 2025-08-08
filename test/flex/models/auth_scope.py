from enum import Enum


class AuthScope(str, Enum):
    MANAGEAUTH = "manage:auth"
    MANAGEDATA = "manage:data"
    READAUTH = "read:auth"
    READDATA = "read:data"
    USEAUTH = "use:auth"
    USEDATA = "use:data"

    def __str__(self) -> str:
        return str(self.value)
