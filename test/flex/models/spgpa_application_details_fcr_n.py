from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

T = TypeVar("T", bound="SpgpaApplicationDetailsFcrN")


@_attrs_define
class SpgpaApplicationDetailsFcrN:
    """Application details for the product type with business ID automatic_frequency_containment (FCR-N). Answered by
    spgpa_assessment_details_fcr_n. The maximum active power in directions up and down must be equal.

        Attributes:
            kind (Literal['automatic_frequency_containment']): Identifies the application details schema. Equals the
                business ID of the product type.
            service_provider_contact_information (str): Contact information of the service provider. Example: Kari Nordmann,
                +47 ....
            technical_contact_information (str): Contact information of the technical contact person. Example: Ola Nordmann,
                +47 ....
            limited_energy_reservoir (bool): Whether the service providing group has a limited energy reservoir. Example:
                True.
            variable_production_consumption (bool): Whether the service providing group has variable production or
                consumption. Example: False.
            planned_prequalification_test_date (datetime.date): The planned date of the prequalification test. Example:
                2026-12-01.
            maximum_active_power_up (float): Maximum active power in kilowatts. Example: 150.5.
            maximum_active_power_down (float): Maximum active power in kilowatts. Example: 150.5.
    """

    kind: Literal["automatic_frequency_containment"]
    service_provider_contact_information: str
    technical_contact_information: str
    limited_energy_reservoir: bool
    variable_production_consumption: bool
    planned_prequalification_test_date: datetime.date
    maximum_active_power_up: float
    maximum_active_power_down: float

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        service_provider_contact_information = self.service_provider_contact_information

        technical_contact_information = self.technical_contact_information

        limited_energy_reservoir = self.limited_energy_reservoir

        variable_production_consumption = self.variable_production_consumption

        planned_prequalification_test_date = self.planned_prequalification_test_date.isoformat()

        maximum_active_power_up = self.maximum_active_power_up

        maximum_active_power_down = self.maximum_active_power_down

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "service_provider_contact_information": service_provider_contact_information,
                "technical_contact_information": technical_contact_information,
                "limited_energy_reservoir": limited_energy_reservoir,
                "variable_production_consumption": variable_production_consumption,
                "planned_prequalification_test_date": planned_prequalification_test_date,
                "maximum_active_power_up": maximum_active_power_up,
                "maximum_active_power_down": maximum_active_power_down,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["automatic_frequency_containment"], d.pop("kind"))
        if kind != "automatic_frequency_containment":
            raise ValueError(f"kind must match const 'automatic_frequency_containment', got '{kind}'")

        service_provider_contact_information = d.pop("service_provider_contact_information")

        technical_contact_information = d.pop("technical_contact_information")

        limited_energy_reservoir = d.pop("limited_energy_reservoir")

        variable_production_consumption = d.pop("variable_production_consumption")

        planned_prequalification_test_date = datetime.date.fromisoformat(d.pop("planned_prequalification_test_date"))

        maximum_active_power_up = d.pop("maximum_active_power_up")

        maximum_active_power_down = d.pop("maximum_active_power_down")

        spgpa_application_details_fcr_n = cls(
            kind=kind,
            service_provider_contact_information=service_provider_contact_information,
            technical_contact_information=technical_contact_information,
            limited_energy_reservoir=limited_energy_reservoir,
            variable_production_consumption=variable_production_consumption,
            planned_prequalification_test_date=planned_prequalification_test_date,
            maximum_active_power_up=maximum_active_power_up,
            maximum_active_power_down=maximum_active_power_down,
        )

        return spgpa_application_details_fcr_n
