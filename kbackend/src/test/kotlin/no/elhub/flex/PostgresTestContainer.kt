package no.elhub.flex

import liquibase.Liquibase
import liquibase.database.DatabaseFactory
import liquibase.database.jvm.JdbcConnection
import liquibase.resource.DirectoryResourceAccessor
import no.elhub.flex.db.FlexTransaction
import org.jetbrains.exposed.v1.jdbc.Database
import org.testcontainers.postgresql.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName
import org.testcontainers.utility.MountableFile
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
        PostgreSQLContainer(
            DockerImageName
                .parse("docker.jfrog.elhub.cloud/frzq0sxltynr/elhub/base/postgres-16:0.0.4")
                .asCompatibleSubstituteFor("postgres")
        )
            .withDatabaseName("flex")
            .withUsername("postgres")
            .withPassword("postgres")
            // pg_cron requires shared_preload_libraries and cron.database_name to be set
            // before the extension can be created.
            .withCommand(
                "-c",
                "shared_preload_libraries=pg_cron",
                "-c",
                "cron.database_name=flex",
                "-c",
                "cron.timezone=Europe/Oslo",
            )
            // creates extensions, the flex role, and all party roles.
            .withCopyFileToContainer(
                MountableFile.forHostPath(findInitSql().absolutePath),
                "/docker-entrypoint-initdb.d/init.sql",
            )
            .withReuse(false)

    private val jdbcUrl: String
        get() = container.jdbcUrl

    private val flexUsername = "flex"
    private val flexPassword = "flex_password"

    private val authenticatorUsername = "flex_authenticator"
    private val authenticatorPassword = "authenticator_password"

    /** Exposed [Database] connected to the test container. */
    val database: Database

    init {
        container.start()
        applyMigrations()
        database = Database.connect(
            url = jdbcUrl,
            driver = "org.postgresql.Driver",
            user = authenticatorUsername,
            password = authenticatorPassword,
        )
        FlexTransaction.init(database)
    }

    /**
     * Opens a plain JDBC [Connection] as the `flex` application user and passes it to [block].
     * The connection is closed after [block] returns.
     * Useful for seeding test data before a test.
     */
    fun <T> withConnection(block: (Connection) -> T): T =
        DriverManager.getConnection(jdbcUrl, flexUsername, flexPassword).use(block)

    private fun applyMigrations() {
        val changelogFile = "changelog.yml"
        val dbDir = findDbDirectory()

        DriverManager.getConnection(jdbcUrl, flexUsername, flexPassword).use { conn ->
            val database =
                DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(JdbcConnection(conn))
            database.defaultSchemaName = "flex"
            database.liquibaseSchemaName = "flex"

            val resourceAccessor = DirectoryResourceAccessor(dbDir)
            Liquibase(changelogFile, resourceAccessor, database).use { liquibase ->
                liquibase.update("")
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

    private fun findInitSql(): File {
        var dir = File(System.getProperty("user.dir"))
        repeat(4) {
            val candidate = File(dir, "local/postgres/init.sql")
            if (candidate.exists()) return candidate
            dir = dir.parentFile ?: return@repeat
        }
        error("Could not find local/postgres/init.sql relative to ${System.getProperty("user.dir")}")
    }
}
