from enum import Enum


class DeviceType(str, Enum):
    EV_CHARGING_DEVICE = "ev_charging_device"
    HVAC = "hvac"
    INVERTER = "inverter"
    OTHER = "other"

    def __str__(self) -> str:
        return str(self.value)
