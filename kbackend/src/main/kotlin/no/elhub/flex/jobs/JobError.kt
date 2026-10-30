package no.elhub.flex.jobs

sealed class JobError {
    data class HttpClientError(val statusCode: Int, val message: String) : JobError()
    data class NetworkError(val message: String) : JobError()
    data class ParsingError(val message: String) : JobError()
    data class DatabaseError(val message: String) : JobError()
    data class ConfigError(val message: String) : JobError()
}
