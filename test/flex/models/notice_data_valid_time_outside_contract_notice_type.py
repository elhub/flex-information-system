from enum import Enum


class NoticeDataValidTimeOutsideContractNoticeType(str, Enum):
    NO_ELHUB_FLEX_CONTROLLABLE_UNIT_SERVICE_PROVIDER_VALID_TIME_OUTSIDE_CONTRACT = (
        "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract"
    )

    def __str__(self) -> str:
        return str(self.value)
