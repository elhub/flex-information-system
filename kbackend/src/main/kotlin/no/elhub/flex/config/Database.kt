package no.elhub.flex.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import no.elhub.flex.db.FlexTransaction
import org.jetbrains.exposed.v1.jdbc.Database

private val logger = KotlinLogging.logger {}

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

/**
 * Creates the HikariCP connection pool, connects Exposed, initialises [FlexTransaction],
 * and returns the datasource. Does not require a Ktor [Application], so it can be used in job mode.
 */
fun createDataSource(
    url: String?,
    driverClass: String?,
    username: String?,
    password: String?,
    maximumPoolSize: Int = 10,
    schema: String? = "api",
): HikariDataSource {
    val config = HikariConfig().apply {
        jdbcUrl = url
        driverClassName = driverClass
        this.username = username
        this.password = password
        this.maximumPoolSize = maximumPoolSize
        this.schema = schema
        transactionIsolation = "TRANSACTION_READ_COMMITTED"
        validate()
    }
    val dataSource = HikariDataSource(config)
    val db = Database.connect(dataSource)
    FlexTransaction.init(db)
    logger.info { "Database pool initialised" }
    return dataSource
}
