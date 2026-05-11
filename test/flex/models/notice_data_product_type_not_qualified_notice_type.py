from enum import Enum


class NoticeDataProductTypeNotQualifiedNoticeType(str, Enum):
    NO_ELHUB_FLEX_SERVICE_PROVIDER_PRODUCT_SUSPENSION_PRODUCT_TYPE_NOT_QUALIFIED = (
        "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified"
    )

    def __str__(self) -> str:
        return str(self.value)
