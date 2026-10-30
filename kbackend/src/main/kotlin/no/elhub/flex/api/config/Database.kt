package no.elhub.flex.api.config

import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.application.Application
import no.elhub.flex.shared.db.createDataSource

/** Configures the database for the running Ktor [Application]. See [createDataSource]. */
fun Application.configureDatabase(): HikariDataSource {
    val config = environment.config.databaseConfig()
    return createDataSource(
        url = config.url,
        driverClass = config.driverClass,
        username = config.username,
        password = config.password,
        maximumPoolSize = config.hikari.maximumPoolSize,
    )
}
