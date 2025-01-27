from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ProductTypeResponse")


@_attrs_define
class ProductTypeResponse:
    """Response schema for operations with return values - Product type.

    Attributes:
        id (Union[Unset, int]): Unique surrogate identifier. Example: 4.
        business_id (Union[Unset, str]): The code for this product type. Example: manual_congestion_activation.
        category (Union[Unset, str]): The category of the product type. Example: congestion.
        market (Union[Unset, str]): The market which the product type belongs to. Example: local.
        market_type (Union[Unset, str]): The type of market which the product type belongs to. Example: activation.
        examples (Union[Unset, str]): Examples of products belonging to this product type. Example: ShortFlex.
        notes (Union[Unset, str]): Additional information about a product type.
    """

    id: Union[Unset, int] = UNSET
    business_id: Union[Unset, str] = UNSET
    category: Union[Unset, str] = UNSET
    market: Union[Unset, str] = UNSET
    market_type: Union[Unset, str] = UNSET
    examples: Union[Unset, str] = UNSET
    notes: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = self.id

        business_id = self.business_id

        category = self.category

        market = self.market

        market_type = self.market_type

        examples = self.examples

        notes = self.notes

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if category is not UNSET:
            field_dict["category"] = category
        if market is not UNSET:
            field_dict["market"] = market
        if market_type is not UNSET:
            field_dict["market_type"] = market_type
        if examples is not UNSET:
            field_dict["examples"] = examples
        if notes is not UNSET:
            field_dict["notes"] = notes

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        id = d.pop("id", UNSET)

        business_id = d.pop("business_id", UNSET)

        category = d.pop("category", UNSET)

        market = d.pop("market", UNSET)

        market_type = d.pop("market_type", UNSET)

        examples = d.pop("examples", UNSET)

        notes = d.pop("notes", UNSET)

        product_type_response = cls(
            id=id,
            business_id=business_id,
            category=category,
            market=market,
            market_type=market_type,
            examples=examples,
            notes=notes,
        )

        product_type_response.additional_properties = d
        return product_type_response

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
