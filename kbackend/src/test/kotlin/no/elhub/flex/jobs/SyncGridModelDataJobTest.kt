package no.elhub.flex.jobs

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.db.FlexTransaction
import no.elhub.flex.gridmodel.db.GridModelRepositoryImpl
import no.elhub.flex.integration.adapter.AdapterHttpClient
import no.elhub.flex.integration.adapter.AdapterWireMockServer
import java.sql.ResultSet

private const val API_KEY = "secret-key"

private const val KRUS = "b1000001-0000-4000-8000-000000000001"
private const val KOPP = "fa000002-0000-4000-8000-000000000002"
private const val GLASS = "a5000003-0000-4000-8000-000000000003"
private const val SOL = "b1000001-0000-4000-8000-000000000012"

private data class Row(val businessId: String, val name: String, val status: String)

/**
 * Runs the whole sync job against the real database: the adapter is a WireMock stub and the
 * database is the Testcontainers Postgres, connected as `flex_staging_structure_data`.
 *
 * The stubbed adapter returns the grid model test data package (db/test_data/staging).
 */
class SyncGridModelDataJobTest : FunSpec({
    extensions(AdapterWireMockServer)

    fun job(finalise: Boolean = true) = SyncGridModelDataJob(
        adapterClient = AdapterHttpClient(AdapterWireMockServer.baseUrl(), API_KEY),
        gridModelRepository = GridModelRepositoryImpl(),
        finalise = finalise,
    )

    fun stubAdapter(body: String) = AdapterWireMockServer.stubFor(
        get(urlPathEqualTo("/grid_model"))
            .willReturn(aResponse().withStatus(200).withHeader("Content-Type", "application/json").withBody(body)),
    )

    fun stubScenario() = AdapterWireMockServer.stubFor(
        get(urlPathEqualTo("/grid_model"))
            .willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBodyFile("grid-model-200.json"),
            ),
    )

    beforeSpec { FlexTransaction.init(PostgresTestContainer.stagingDatabase) }
    afterSpec { FlexTransaction.init(PostgresTestContainer.database) }

    beforeTest {
        AdapterWireMockServer.resetAll()
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.line, flex.substation, flex.substation_cluster CASCADE")
            }
        }
    }

    test("sync loads substation clusters, substations and lines into flex") {
        stubScenario()

        job().run().shouldBeRight()

        clusters() shouldBe listOf(
            Row(GLASS, "Glass", "active"),
            Row(KRUS, "Krus", "active"),
            Row(KOPP, "Kopp", "active"),
        )
        substations().size shouldBe 7
        substations().all { it.status == "active" } shouldBe true
        lines() shouldBe listOf(
            Row("11100001-0000-4000-8000-000000000001", "Linje1", "active"),
            Row("11100001-0000-4000-8000-000000000002", "Linje2", "active"),
        )

        query(
            """
            SELECT s.kind, s.primary_concessionaire, s.voltage_levels::text, sc.business_id,
                   ST_Y(s.position), ST_X(s.position)
            FROM flex.substation AS s
                INNER JOIN flex.substation_cluster AS sc ON sc.id = s.substation_cluster_id
            WHERE s.business_id = '$SOL'
            """.trimIndent(),
        ) {
            listOf(it.getString(1), it.getString(2), it.getString(3), it.getString(4), it.getDouble(5), it.getDouble(6))
        }.single() shouldBe listOf("transformer", "BKK", "{11.000,66.000}", KRUS, 60.3975, 5.3269)

        query(
            """
            SELECT f.business_id, t.business_id
            FROM flex.line AS l
                INNER JOIN flex.substation_cluster AS f ON f.id = l.from_substation_cluster_id
                INNER JOIN flex.substation_cluster AS t ON t.id = l.to_substation_cluster_id
            ORDER BY l.business_id
            """.trimIndent(),
        ) { it.getString(1) to it.getString(2) } shouldBe listOf(KRUS to KOPP, KRUS to GLASS)
    }

    test("running the sync twice gives the same result as running it once") {
        stubScenario()
        job().run().shouldBeRight()
        val clusters = clusters()
        val substations = substations()
        val lines = lines()
        val recordTimes = recordTimes()

        job().run().shouldBeRight()

        clusters() shouldBe clusters
        substations() shouldBe substations
        lines() shouldBe lines
        // no-op merge: nothing is detected as changed, so no new versions are recorded
        recordTimes() shouldBe recordTimes
    }

    test("without finalise, data is only loaded into staging") {
        stubScenario()

        job(finalise = false).run().shouldBeRight()

        query("SELECT count(*) FROM staging.substation_cluster") { it.getInt(1) } shouldBe listOf(3)
        query("SELECT count(*) FROM staging.substation") { it.getInt(1) } shouldBe listOf(7)
        query("SELECT count(*) FROM staging.line") { it.getInt(1) } shouldBe listOf(2)
        clusters() shouldBe emptyList()
        substations() shouldBe emptyList()
        lines() shouldBe emptyList()
    }

    test("an adapter response that would remove too much data is rejected and flex is left untouched") {
        stubScenario()
        job().run().shouldBeRight()
        val substations = substations()

        stubAdapter("""{"substations": [], "substation_clusters": [], "lines": []}""")
        job().run().shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()

        substations() shouldBe substations
        query("SELECT count(*) FROM staging.substation") { it.getInt(1) } shouldBe listOf(7)
    }

    test("an adapter failure is returned as an error and flex is left untouched") {
        AdapterWireMockServer.stubFor(
            get(urlPathEqualTo("/grid_model")).willReturn(aResponse().withStatus(500)),
        )

        job().run().shouldBeLeft().shouldBeInstanceOf<JobError.HttpClientError>()

        substations() shouldBe emptyList()
    }
})

private fun rows(table: String): List<Row> =
    query("SELECT business_id, name, status FROM flex.$table ORDER BY business_id") {
        Row(it.getString(1), it.getString(2), it.getString(3))
    }

private fun clusters() = rows("substation_cluster")

private fun substations() = rows("substation")

private fun lines() = rows("line")

private fun recordTimes(): List<String> =
    listOf("substation_cluster", "substation", "line").flatMap { table ->
        query("SELECT business_id || ' ' || lower(record_time_range) FROM flex.$table ORDER BY business_id") {
            it.getString(1)
        }
    }

private fun <T> query(sql: String, mapper: (ResultSet) -> T): List<T> =
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery(sql).use { rs -> buildList { while (rs.next()) add(mapper(rs)) } }
        }
    }
