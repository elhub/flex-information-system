from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointBalanceResponsiblePartyHistoryResponse")


@_attrs_define
class AccountingPointBalanceResponsiblePartyHistoryResponse:
    """Accounting Point Balance Responsible Party - history

    Attributes:
        id (Union[Unset, int]): Unique surrogate identifier. Example: 19.
        accounting_point_id (Union[Unset, str]): The GSRN metering point ID of the accounting point. Example:
            709000000000000057.
        balance_responsible_party_id (Union[Unset, int]): The balance responsible party of the accounting point.
            Example: 37.
        valid_from (Union[Unset, str]): The date from which the relation between the accounting point and the balance
            responsible party is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
        valid_to (Union[None, Unset, str]): The date until which the relation between the accounting point and the
            balance responsible party is valid. Midnight aligned on Norwegian timezone.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        accounting_point_balance_responsible_party_id (Union[Unset, int]): Reference to the resource that was updated.
            Example: 48.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    id: Union[Unset, int] = UNSET
    accounting_point_id: Union[Unset, str] = UNSET
    balance_responsible_party_id: Union[Unset, int] = UNSET
    valid_from: Union[Unset, str] = UNSET
    valid_to: Union[None, Unset, str] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    accounting_point_balance_responsible_party_id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = self.id

        accounting_point_id = self.accounting_point_id

        balance_responsible_party_id = self.balance_responsible_party_id

        valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        accounting_point_balance_responsible_party_id = self.accounting_point_balance_responsible_party_id

        replaced_by: Union[None, Unset, int]
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: Union[None, Unset, str]
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id
        if balance_responsible_party_id is not UNSET:
            field_dict["balance_responsible_party_id"] = balance_responsible_party_id
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if accounting_point_balance_responsible_party_id is not UNSET:
            field_dict["accounting_point_balance_responsible_party_id"] = accounting_point_balance_responsible_party_id
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        id = d.pop("id", UNSET)

        accounting_point_id = d.pop("accounting_point_id", UNSET)

        balance_responsible_party_id = d.pop("balance_responsible_party_id", UNSET)

        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        accounting_point_balance_responsible_party_id = d.pop("accounting_point_balance_responsible_party_id", UNSET)

        def _parse_replaced_by(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        accounting_point_balance_responsible_party_history_response = cls(
            id=id,
            accounting_point_id=accounting_point_id,
            balance_responsible_party_id=balance_responsible_party_id,
            valid_from=valid_from,
            valid_to=valid_to,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            accounting_point_balance_responsible_party_id=accounting_point_balance_responsible_party_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        accounting_point_balance_responsible_party_history_response.additional_properties = d
        return accounting_point_balance_responsible_party_history_response

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
