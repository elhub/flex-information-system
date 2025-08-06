from enum import Enum


class AuthScope(str, Enum):
    AUTHMANAGE = "auth:manage"
    AUTHREAD = "auth:read"
    AUTHUSE = "auth:use"
    DATAMANAGE = "data:manage"
    DATAREAD = "data:read"
    DATAUSE = "data:use"

    def __str__(self) -> str:
        return str(self.value)
