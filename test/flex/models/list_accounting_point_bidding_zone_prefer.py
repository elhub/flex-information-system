from enum import Enum


class ListAccountingPointBiddingZonePrefer(str, Enum):
    COUNTNONE = "count=none"

    def __str__(self) -> str:
        return str(self.value)
