package no.elhub.flex

import liquibase.Liquibase
import liquibase.database.DatabaseFactory
import liquibase.database.jvm.JdbcConnection
import liquibase.resource.DirectoryResourceAccessor
import no.elhub.flex.db.FlexTransaction
import org.jetbrains.exposed.v1.jdbc.Database
import org.testcontainers.postgresql.PostgreSQLContainer
import java.io.File
import java.sql.Connection
import java.sql.DriverManager

/**
 * Shared Testcontainers Postgres instance for repository integration tests.
 *
 * Liquibase migrations from `db/changelog.yml` are applied on first access;
 * no test data is loaded — each test is responsible for seeding its own data.
 *
 * The Exposed [database] instance is initialised and [no.elhub.flex.db.FlexTransaction]
 * is wired up.
 */
object PostgresTestContainer {

    private val container: PostgreSQLContainer =
        PostgreSQLContainer("postgres:17")
            .withDatabaseName("flex")
            .withUsername("postgres")
            .withPassword("postgres")
            // db-init.sql creates extensions, the flex role, and all party roles.
            .withInitScript("db-init.sql")
            .withReuse(false)

    /** The `flex` application user (used after init). */
    private val flexJdbcUrl: String
        get() = container.jdbcUrl

    private val flexUsername = "flex"
    private val flexPassword = "flex_password"

    /** Exposed [Database] connected to the test container. */
    val database: Database

    init {
        container.start()
        applyMigrations()
        database = Database.connect(
            url = flexJdbcUrl,
            driver = "org.postgresql.Driver",
            user = flexUsername,
            password = flexPassword,
        )
        FlexTransaction.init(database)
    }

    /**
     * Opens a plain JDBC [Connection] as the `flex` application user and passes it to [block].
     * The connection is closed after [block] returns.
     * Useful for seeding test data before a test.
     */
    fun <T> withConnection(block: (Connection) -> T): T =
        DriverManager.getConnection(flexJdbcUrl, flexUsername, flexPassword).use(block)

    private fun applyMigrations() {
        val changelogFile = "changelog.yml"
        val dbDir = findDbDirectory()

        DriverManager.getConnection(flexJdbcUrl, flexUsername, flexPassword).use { conn ->
            val database =
                DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(JdbcConnection(conn))
            database.defaultSchemaName = "flex"
            database.liquibaseSchemaName = "flex"

            val resourceAccessor = DirectoryResourceAccessor(dbDir)
            Liquibase(changelogFile, resourceAccessor, database).use { liquibase ->
                // Pass "test" context so changesets tagged context:local (e.g. pg_cron schedule)
                // are skipped in the test container.
                liquibase.update("test")
            }
        }
    }

    private fun findDbDirectory(): File {
        var dir = File(System.getProperty("user.dir"))
        repeat(4) {
            val candidate = File(dir, "db")
            if (candidate.isDirectory && File(candidate, "changelog.yml").exists()) return candidate
            dir = dir.parentFile ?: return@repeat
        }
        error("Could not find db/changelog.yml relative to ${System.getProperty("user.dir")}")
    }
}
