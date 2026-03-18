package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator

@Serializable
@JsonClassDiscriminator("kind")
@ExperimentalSerializationApi
public sealed interface NoticeData
