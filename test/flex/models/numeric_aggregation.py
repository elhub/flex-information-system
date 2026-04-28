from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define

from ..types import UNSET, Unset

T = TypeVar("T", bound="NumericAggregation")


@_attrs_define
class NumericAggregation:
    """
    Attributes:
        sum_ (float | Unset):
        average (float | Unset):
        min_ (float | Unset):
        max_ (float | Unset):
    """

    sum_: float | Unset = UNSET
    average: float | Unset = UNSET
    min_: float | Unset = UNSET
    max_: float | Unset = UNSET

    def to_dict(self) -> dict[str, Any]:
        sum_ = self.sum_

        average = self.average

        min_ = self.min_

        max_ = self.max_

        field_dict: dict[str, Any] = {}

        field_dict.update({})
        if sum_ is not UNSET:
            field_dict["sum"] = sum_
        if average is not UNSET:
            field_dict["average"] = average
        if min_ is not UNSET:
            field_dict["min"] = min_
        if max_ is not UNSET:
            field_dict["max"] = max_

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        sum_ = d.pop("sum", UNSET)

        average = d.pop("average", UNSET)

        min_ = d.pop("min", UNSET)

        max_ = d.pop("max", UNSET)

        numeric_aggregation = cls(
            sum_=sum_,
            average=average,
            min_=min_,
            max_=max_,
        )

        return numeric_aggregation
