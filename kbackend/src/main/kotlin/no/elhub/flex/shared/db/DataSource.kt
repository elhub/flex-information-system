package no.elhub.flex.shared.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.oshai.kotlinlogging.KotlinLogging
import org.jetbrains.exposed.v1.jdbc.Database

private val logger = KotlinLogging.logger {}

/**
 * Creates the HikariCP connection pool, connects Exposed, initialises [FlexTransaction],
 * and returns the datasource. Does not require a Ktor application, so it can be used in job mode.
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
