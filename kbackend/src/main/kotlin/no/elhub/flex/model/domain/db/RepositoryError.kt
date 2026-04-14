package no.elhub.flex.model.domain.db

sealed class RepositoryError(val message: String)

data class NotFoundError(val detail: String) : RepositoryError(detail)
data class NoMatchError(val detail: String) : RepositoryError(detail)
data class DatabaseError(val detail: String) : RepositoryError(detail)
