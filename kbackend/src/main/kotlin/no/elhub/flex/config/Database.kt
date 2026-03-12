package no.elhub.flex.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import no.elhub.flex.db.FlexTransaction
import org.jetbrains.exposed.v1.jdbc.Database

private val logger = KotlinLogging.logger {}

/**
 * Configures the HikariCP connection pool from `ktor.database.*` config keys,
 * connects Exposed, initialises [FlexTransaction], and returns the datasource.
 */
fun Application.configureDatabase(): HikariDataSource {
    val config = HikariConfig().apply {
        jdbcUrl = environment.config.propertyOrNull("ktor.database.url")?.getString()
        driverClassName = environment.config.propertyOrNull("ktor.database.driverClass")?.getString()
        username = environment.config.propertyOrNull("ktor.database.username")?.getString()
        password = environment.config.propertyOrNull("ktor.database.password")?.getString()
        maximumPoolSize =
            environment.config.propertyOrNull("ktor.database.hikari.maximumPoolSize")?.getString()?.toInt() ?: 10
        schema = "api"
        isAutoCommit = false
        transactionIsolation = "TRANSACTION_READ_COMMITTED"
        validate()
    }
    val dataSource = HikariDataSource(config)
    val db = Database.connect(dataSource)
    FlexTransaction.init(db)
    logger.info { "Database pool initialised" }
    return dataSource
}
