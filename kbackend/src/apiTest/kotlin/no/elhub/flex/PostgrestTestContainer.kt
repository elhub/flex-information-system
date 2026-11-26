package no.elhub.flex

import no.elhub.flex.auth.util.TEST_JWT_SECRET
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.utility.DockerImageName

private const val POSTGREST_PORT = 3000

/**
 * Shared PostgREST container in front of [PostgresTestContainer], configured like `postgrest` in `docker-compose.yml`.
 *
 * It starts after the migrations have been applied, so PostgREST loads the final schema. Tokens are verified
 * with [TEST_JWT_SECRET], the same secret that the in-process backend uses.
 */
object PostgrestTestContainer {

    private val container: GenericContainer<*> =
        GenericContainer(DockerImageName.parse("postgrest/postgrest:latest"))
            .withNetwork(PostgresTestContainer.network)
            .withExposedPorts(POSTGREST_PORT)
            .withEnv(
                mapOf(
                    "PGRST_DB_URI" to "postgres://${PostgresTestContainer.AUTHENTICATOR_USERNAME}:" +
                        "${PostgresTestContainer.AUTHENTICATOR_PASSWORD}@${PostgresTestContainer.NETWORK_ALIAS}:5432/flex",
                    "PGRST_DB_ANON_ROLE" to "flex_anonymous",
                    "PGRST_DB_PRE_REQUEST" to "auth.pre_request",
                    "PGRST_DB_SCHEMAS" to "api,attachment,grid",
                    "PGRST_DB_EXTRA_SEARCH_PATH" to "flex,public",
                    "PGRST_JWT_SECRET" to TEST_JWT_SECRET,
                    "PGRST_JWT_SECRET_IS_BASE64" to "False",
                    "PGRST_OPENAPI_MODE" to "ignore-privileges",
                ),
            )
            .waitingFor(Wait.forHttp("/").forPort(POSTGREST_PORT).forStatusCode(200))

    init {
        PostgresTestContainer.database
        container.start()
    }

    val baseUrl: String
        get() = "http://${container.host}:${container.getMappedPort(POSTGREST_PORT)}"
}
