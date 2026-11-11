from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

from ..models.spgpa_ramping_capability import SpgpaRampingCapability
from ..types import UNSET, Unset

T = TypeVar("T", bound="SpgpaApplicationDetailsMfrr")


@_attrs_define
class SpgpaApplicationDetailsMfrr:
    """Product-specific application details for Manual Frequency Restoration (mFRR), written by the service provider. Has
    no assessment details.

        Attributes:
            kind (Literal['manual_frequency_restoration']): Identifies the product type of the application details.
            maximum_active_power_up (float): Maximum active power, in kilowatts. Example: 150.5.
            maximum_active_power_down (float): Maximum active power, in kilowatts. Example: 150.5.
            ramping_capability (SpgpaRampingCapability): Whether the service providing group can ramp in accordance with the
                product requirements during both activation and deactivation. Example: always.
            ramping_description (str): Free text description of ramping details. Example: Units are (dis)connected one by
                one to achieve a stepwise profile..
            additional_information (str | Unset): Free text field for extra information about the application if needed
                (bidding periods, unavailabilities, etc). Example: Available on weekdays only..
    """

    kind: Literal["manual_frequency_restoration"]
    maximum_active_power_up: float
    maximum_active_power_down: float
    ramping_capability: SpgpaRampingCapability
    ramping_description: str
    additional_information: str | Unset = UNSET

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        maximum_active_power_up = self.maximum_active_power_up

        maximum_active_power_down = self.maximum_active_power_down

        ramping_capability = self.ramping_capability.value

        ramping_description = self.ramping_description

        additional_information = self.additional_information

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "maximum_active_power_up": maximum_active_power_up,
                "maximum_active_power_down": maximum_active_power_down,
                "ramping_capability": ramping_capability,
                "ramping_description": ramping_description,
            }
        )
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["manual_frequency_restoration"], d.pop("kind"))
        if kind != "manual_frequency_restoration":
            raise ValueError(f"kind must match const 'manual_frequency_restoration', got '{kind}'")

        maximum_active_power_up = d.pop("maximum_active_power_up")

        maximum_active_power_down = d.pop("maximum_active_power_down")

        ramping_capability = SpgpaRampingCapability(d.pop("ramping_capability"))

        ramping_description = d.pop("ramping_description")

        additional_information = d.pop("additional_information", UNSET)

        spgpa_application_details_mfrr = cls(
            kind=kind,
            maximum_active_power_up=maximum_active_power_up,
            maximum_active_power_down=maximum_active_power_down,
            ramping_capability=ramping_capability,
            ramping_description=ramping_description,
            additional_information=additional_information,
        )

        return spgpa_application_details_mfrr
