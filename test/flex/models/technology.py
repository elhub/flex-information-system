from enum import Enum


class Technology(str, Enum):
    BACKUP_GENERATOR = "backup_generator"
    BATTERY = "battery"
    BOILER = "boiler"
    EV_CHARGING_DEVICE = "ev_charging_device"
    EV_CHARGING_DEVICE_V2G = "ev_charging_device.v2g"
    HEAT_POWER_PLANT = "heat_power_plant"
    HEAT_POWER_PLANT_CHP = "heat_power_plant.chp"
    HVAC = "hvac"
    HVAC_HEAT = "hvac.heat"
    HVAC_HEAT_PUMP = "hvac.heat_pump"
    HYDROPOWER = "hydropower"
    HYDROPOWER_PUMPED = "hydropower.pumped"
    HYDROPOWER_RUN_OF_RIVER = "hydropower.run_of_river"
    LIGHTING = "lighting"
    OTHER_CONSUMPTION = "other.consumption"
    OTHER_ENERGY_STORAGE = "other.energy_storage"
    OTHER_PRODUCTION = "other.production"
    SOLAR = "solar"
    WATER_HEATER = "water_heater"
    WIND = "wind"

    def __str__(self) -> str:
        return str(self.value)
