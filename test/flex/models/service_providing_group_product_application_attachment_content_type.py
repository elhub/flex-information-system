from enum import StrEnum


class ServiceProvidingGroupProductApplicationAttachmentContentType(StrEnum):
    APPLICATIONPDF = "application/pdf"
    IMAGEJPEG = "image/jpeg"
    IMAGEPNG = "image/png"

    def __str__(self) -> str:
        return str(self.value)
