from enum import StrEnum


class AccountingPointBiddingZoneBiddingZone(StrEnum):
    NO1 = "NO1"
    NO2 = "NO2"
    NO3 = "NO3"
    NO4 = "NO4"
    NO5 = "NO5"

    def __str__(self) -> str:
        return str(self.value)
