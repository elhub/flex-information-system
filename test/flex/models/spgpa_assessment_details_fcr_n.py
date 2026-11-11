from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

T = TypeVar("T", bound="SpgpaAssessmentDetailsFcrN")


@_attrs_define
class SpgpaAssessmentDetailsFcrN:
    """Product-specific assessment details for FCR-N, written by the procuring system operator. Answers
    `spgpa_application_details_fcr_n`. FCR-N is symmetric, so the approved maximum active power up and down must be
    equal.

        Attributes:
            kind (Literal['automatic_frequency_containment']): Identifies the product type of the assessment details.
            approved_maximum_active_power_up (float): Maximum active power, in kilowatts. Example: 150.5.
            approved_maximum_active_power_down (float): Maximum active power, in kilowatts. Example: 150.5.
    """

    kind: Literal["automatic_frequency_containment"]
    approved_maximum_active_power_up: float
    approved_maximum_active_power_down: float

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        approved_maximum_active_power_up = self.approved_maximum_active_power_up

        approved_maximum_active_power_down = self.approved_maximum_active_power_down

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "approved_maximum_active_power_up": approved_maximum_active_power_up,
                "approved_maximum_active_power_down": approved_maximum_active_power_down,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["automatic_frequency_containment"], d.pop("kind"))
        if kind != "automatic_frequency_containment":
            raise ValueError(f"kind must match const 'automatic_frequency_containment', got '{kind}'")

        approved_maximum_active_power_up = d.pop("approved_maximum_active_power_up")

        approved_maximum_active_power_down = d.pop("approved_maximum_active_power_down")

        spgpa_assessment_details_fcr_n = cls(
            kind=kind,
            approved_maximum_active_power_up=approved_maximum_active_power_up,
            approved_maximum_active_power_down=approved_maximum_active_power_down,
        )

        return spgpa_assessment_details_fcr_n
