from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.line import Line
    from ..models.substation import Substation
    from ..models.substation_cluster import SubstationCluster


T = TypeVar("T", bound="GridModel")


@_attrs_define
class GridModel:
    """
    Attributes:
        substations (list[Substation]):
        substation_clusters (list[SubstationCluster]):
        lines (list[Line]):
    """

    substations: list[Substation]
    substation_clusters: list[SubstationCluster]
    lines: list[Line]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        substations = []
        for substations_item_data in self.substations:
            substations_item = substations_item_data.to_dict()
            substations.append(substations_item)

        substation_clusters = []
        for substation_clusters_item_data in self.substation_clusters:
            substation_clusters_item = substation_clusters_item_data.to_dict()
            substation_clusters.append(substation_clusters_item)

        lines = []
        for lines_item_data in self.lines:
            lines_item = lines_item_data.to_dict()
            lines.append(lines_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "substations": substations,
                "substation_clusters": substation_clusters,
                "lines": lines,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.line import Line  # noqa: PLC0415
        from ..models.substation import Substation  # noqa: PLC0415
        from ..models.substation_cluster import SubstationCluster  # noqa: PLC0415

        d = dict(src_dict)
        substations = []
        _substations = d.pop("substations")
        for substations_item_data in _substations:
            substations_item = Substation.from_dict(substations_item_data)

            substations.append(substations_item)

        substation_clusters = []
        _substation_clusters = d.pop("substation_clusters")
        for substation_clusters_item_data in _substation_clusters:
            substation_clusters_item = SubstationCluster.from_dict(
                substation_clusters_item_data
            )

            substation_clusters.append(substation_clusters_item)

        lines = []
        _lines = d.pop("lines")
        for lines_item_data in _lines:
            lines_item = Line.from_dict(lines_item_data)

            lines.append(lines_item)

        grid_model = cls(
            substations=substations,
            substation_clusters=substation_clusters,
            lines=lines,
        )

        grid_model.additional_properties = d
        return grid_model

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
