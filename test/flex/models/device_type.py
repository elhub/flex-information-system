from enum import Enum


class DeviceType(str, Enum):
    BOILER = "boiler"
    ENERGY_MANAGEMENT_SYSTEM = "energy_management_system"
    EV_CHARGING_DEVICE = "ev_charging_device"
    HVAC = "hvac"
    INVERTER = "inverter"
    OTHER = "other"
    SOCKET = "socket"
    WATER_HEATER = "water_heater"

    def __str__(self) -> str:
        return str(self.value)
